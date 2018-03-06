#include "Image.h"
#include <SDL2/SDL_image.h>
#include <sstream>
#include <cassert>
#include <iostream>

namespace grynca {

    inline Image::Image()
     : surface_(NULL)
    {}

    inline Image::Image(u32 width, u32 height, GLenum gl_format)
     : Image()
    {
        SDL_PixelFormat* f = SDL_AllocFormat(GLFormat2SDLFormat_(gl_format));
        if (!f) {
            std::cerr << SDL_GetError() << std::endl;
            return;
        }

        surface_ = SDL_CreateRGBSurface(0,width,height,
                                        f->BitsPerPixel, f->Rmask, f->Gmask, f->Bmask, f->Amask);
        SDL_FreeFormat(f);  // no longer needed (was used only for getting params to surface creation func)

        if(!surface_) {
            std::cerr << SDL_GetError() << std::endl;
            return;
        }

        if (gl_format == GL_LUMINANCE) {
            // free automatically created empty palette
            SDL_FreePalette(surface_->format->palette);
            surface_->format->palette = NULL;
            // create grayscale palette instead
            SDL_Palette * p = createGreyscalePalette_();
            SDL_SetPixelFormatPalette(surface_->format, p);
        }
        if (gl_format == GL_ALPHA) {
            flags_[0] = true;
        }

        ASSERT_M(surface_->format->BytesPerPixel*surface_->w == surface_->pitch, "ugh, image row padding not supported. ");
    }

    inline Image::Image(const Path& filepath)
     : Image()
    {
        setImage_(filepath);
    }

    inline Image::Image(Image&& i) {
        surface_ = i.surface_;
        i.surface_ = NULL;
    }

    inline Image::~Image() {
        if (surface_)
            SDL_FreeSurface(surface_);
    }

    inline Image& Image::operator=(Image&& i) {
        surface_ = i.surface_;
        i.surface_ = NULL;
        return *this;
    }

    inline void Image::load(const Path& filepath) {
        setImage_(filepath);
    }

    inline bool Image::isNull()const {
        return !surface_;
    }

    inline Vec2 Image::getSize()const {
        return {(f32)getWidth(), (f32)getHeight()};
    }

    inline u32 Image::getWidth()const {
        ASSERT(!isNull());
        return u32(surface_->w);
    }

    inline u32 Image::getHeight()const {
        ASSERT(!isNull());
        return u32(surface_->h);
    }

    inline u8 Image::getDepth()const {
        ASSERT(!isNull());
        return surface_->format->BytesPerPixel;
    }

    inline u32 Image::getPitch()const {
        ASSERT(!isNull());
        return u32(surface_->pitch);
    }

    inline const u8* Image::getDataPtr() const {
        ASSERT(!isNull());
        return (u8*)surface_->pixels;
    }

    inline u8* Image::getDataPtr() {
        ASSERT(!isNull());
        return (u8*)surface_->pixels;
    }

    inline fast_vector<u8> Image::getRectData(const ARect& subrect) {
        fast_vector<u8> data;
        u32 data_size = (u32)subrect.getWidth()*(u32)subrect.getHeight();
        data.resize(data_size);
        copyRectOut(subrect, &data[0]);
        return data;
    }

    inline void Image::copyRectOut(const ARect& subrect, void* data_out) {
        ASSERT(!isNull());
        // checks if sub region fits into image
        ASSERT(subrect.getX() >= 0 && subrect.getY() >= 0);
        ASSERT(subrect.getWidth() > 0 && subrect.getHeight() > 0);
        ASSERT(subrect.getRightBot().getX() <= getWidth());
        ASSERT(subrect.getRightBot().getY() <= getHeight());

        u32 img_pitch = getPitch();
        u32 sub_pitch = u32(subrect.getWidth() * getDepth());
        u8 *dest = (u8*)data_out;
        u8 *src = getDataPtr();
        u32 src_pos = u32(subrect.getY() * getPitch() + subrect.getX() * getDepth());
        u32 dst_pos = 0;
        for (unsigned int i = 0; i < subrect.getHeight(); ++i) {
            memcpy(&dest[dst_pos], &src[src_pos], sub_pitch);
            dst_pos += sub_pitch;
            src_pos += img_pitch;
        }
    }

    inline GLenum Image::getGLFormat() const {
        ASSERT(!isNull());
        GLenum gl_format = 0;
        switch (getDepth()) {
            case 1:
                if (flags_[0])
                    gl_format = GL_ALPHA;
                else
                    gl_format = GL_LUMINANCE;
                break;
            case 3:
                if (surface_->format->Rshift < surface_->format->Bshift)
                    gl_format = GL_RGB;
                else
                    gl_format = GL_BGR;
                break;
            case 4:
                if (surface_->format->Rshift < surface_->format->Bshift)
                    gl_format = GL_RGBA;
                else
                    gl_format = GL_BGRA;
                break;
            case 2:
            default:
                std::cerr << "[Image::getGLFormat] Unknown image format (bytes per pixel)." << std::endl;
        }
        return gl_format;
    }

    inline bool Image::convertTo(GLenum gl_format) {
        ASSERT(!isNull());
        SDL_PixelFormat *f = SDL_AllocFormat(GLFormat2SDLFormat_(gl_format));
        if (!f) {
            std::cerr << SDL_GetError() << std::endl;
            return false;
        }
        SDL_Palette* p = NULL;
        if (gl_format == GL_LUMINANCE) {
            p = createGreyscalePalette_();
            SDL_SetPixelFormatPalette(f, p);
        }

        SDL_Surface* new_surface = SDL_ConvertSurface(surface_, f, 0);

        if (!new_surface) {
            std::cerr << SDL_GetError() << std::endl;
        }

        SDL_FreeSurface(surface_);
        surface_ = new_surface;

        SDL_FreePalette(p);
        SDL_FreeFormat(f);
        return new_surface!=NULL;
    }

    inline bool Image::saveToPNG(const Path& filepath) {
        assert(!isNull());
        bool rslt = (IMG_SavePNG(surface_, filepath.getPath().c_str()) != -1);

        if (!rslt) {
            std::cerr << IMG_GetError() << std::endl;
        }
        return rslt;
    }

    inline SDL_Surface* Image::getInternal() {
        return surface_;
    }

    inline Color Image::getPixel(u32 x, u32 y) {
        ASSERT(x < getWidth() && y<getHeight());
        Color rslt;
        SDL_GetRGBA(getPixel_(x, y), surface_->format, &rslt.r, &rslt.g, &rslt.b, &rslt.a);
        return rslt;
    }

    inline void Image::setPixel(u32 x, u32 y, Color color) {
        ASSERT(x < getWidth() && y<getHeight());
        setPixel_(x, y, SDL_MapRGBA(surface_->format, color.r, color.g, color.b, color.a));
    }

    inline void Image::fillWithColor(Color color) {
        ASSERT(!isNull());
        u32 mapped_clr = SDL_MapRGBA(surface_->format, color.r, color.g, color.b, color.a);
        for (u32 x = 0; x<getWidth(); ++x) {
            for (u32 y = 0; y<getHeight(); ++y) {
                setPixel_(x, y, mapped_clr);
            }
        }
    }

    inline u32 Image::getFormatDepth(GLenum format) {
        //static
        switch (format) {
            case GL_LUMINANCE:
            case GL_ALPHA:
                return 1;
            case GL_RGB:
            case GL_BGR:
                return 3;
            case GL_RGBA:
            case GL_BGRA:
                return 4;
            default:
                ASSERT_M(false, "Unknown GL format");
                return u32(-1);
        }
    }

    inline void Image::setImage_(const Path& filepath) {
        surface_ = IMG_Load(filepath.getPath().c_str());
        if(!surface_) {
            std::cerr << IMG_GetError() << std::endl;
        }
    }

    inline SDL_Palette* Image::createGreyscalePalette_() {
        SDL_Palette* p = SDL_AllocPalette(256);
        SDL_Color colors[256];
        for(u32 i=0;i<=255;i++){
            colors[i].r=(u8)i;
            colors[i].g=(u8)i;
            colors[i].b=(u8)i;
            colors[i].a=255;
        }
        SDL_SetPaletteColors(p, colors, 0, 256);
        return p;
    }

    inline u32 Image::GLFormat2SDLFormat_(GLenum gl_format) {
        switch (gl_format) {
            case GL_LUMINANCE:
            case GL_ALPHA:
                return SDL_PIXELFORMAT_INDEX8;
            case GL_RGB:
#if SDL_BYTEORDER == SDL_LIL_ENDIAN
                return SDL_PIXELFORMAT_BGR888;
#else
                return SDL_PIXELFORMAT_RGB888;
#endif
            case GL_BGR:
#if SDL_BYTEORDER == SDL_LIL_ENDIAN
                return SDL_PIXELFORMAT_RGB888;
#else
                return SDL_PIXELFORMAT_BGR888;
#endif
            case GL_RGBA:
#if SDL_BYTEORDER == SDL_LIL_ENDIAN
                return SDL_PIXELFORMAT_ABGR8888;
#else
                return SDL_PIXELFORMAT_RGBA8888;
#endif
            case GL_BGRA:
#if SDL_BYTEORDER == SDL_LIL_ENDIAN
                return SDL_PIXELFORMAT_ARGB8888;
#else
                return SDL_PIXELFORMAT_BGRA8888;
#endif
            default:
                ASSERT(!"unknown format type");
                return 0;
        }
    }

    inline u32 Image::getPixel_(u32 x, u32 y) {
        int bpp = surface_->format->BytesPerPixel;
        u8 *p = (u8*)surface_->pixels + y * surface_->pitch + x * bpp;

        switch(bpp) {
            case 1:
                return *p;
            case 2:
                return *(Uint16 *)p;
            case 3:
                if(SDL_BYTEORDER == SDL_BIG_ENDIAN)
                    return p[0] << 16 | p[1] << 8 | p[2];
                else
                    return p[0] | p[1] << 8 | p[2] << 16;
            case 4:
                return *(u32*)p;
            default:
                NEVER_GET_HERE("invalid bpp");
                return 0;
        }
    }

    inline void Image::setPixel_(u32 x, u32 y, u32 pixel_val) {
        int bpp = surface_->format->BytesPerPixel;
        u8* p = (u8*)surface_->pixels + y * surface_->pitch + x * bpp;

        switch(bpp) {
            case 1:
                *p = u8(pixel_val);
                break;
            case 2:
                *(u16*)p = u16(pixel_val);
                break;
            case 3:
                if(SDL_BYTEORDER == SDL_BIG_ENDIAN) {
                    p[0] = u8((pixel_val >> 16) & 0xff);
                    p[1] = u8((pixel_val >> 8) & 0xff);
                    p[2] = u8(pixel_val & 0xff);
                } else {
                    p[0] = u8(pixel_val& 0xff);
                    p[1] = u8((pixel_val >> 8) & 0xff);
                    p[2] = u8((pixel_val >> 16) & 0xff);
                }
                break;

            case 4:
                *(u32*)p = pixel_val;
                break;
            default:
                NEVER_GET_HERE("invalid bpp");
                break;
        }
    }

    inline std::ostream& operator <<(std::ostream& os, const Color & p) {
        std::cout << "[" << (int)p.r << ", " << (int)p.g << ", " << (int)p.b << ", " << (int)p.a << "]";
        return os;
    }

    inline std::ostream& operator <<(std::ostream& os, const Colorf & p) {
        std::cout << "[" << p.r << ", " << p.g << ", " << p.b << ", " << p.a << "]";
        return os;
    }
}
