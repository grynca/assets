#include "Image.h"
#include <SDL2/SDL_image.h>
#include <sstream>
#include <cassert>
#include <iostream>

namespace grynca {

    inline Image::Image()
     : surface_(NULL)
    {}

    inline Image::Image(uint32_t width, uint32_t height, GLenum gl_format)
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
        return {(float)getWidth(), (float)getHeight()};
    }

    inline uint32_t Image::getWidth()const {
        ASSERT(!isNull());
        return uint32_t(surface_->w);
    }

    inline uint32_t Image::getHeight()const {
        ASSERT(!isNull());
        return uint32_t(surface_->h);
    }

    inline uint8_t Image::getDepth()const {
        ASSERT(!isNull());
        return surface_->format->BytesPerPixel;
    }

    inline uint32_t Image::getPitch()const {
        ASSERT(!isNull());
        return uint32_t(surface_->pitch);
    }

    inline uint8_t const* Image::getDataPtr() const {
        ASSERT(!isNull());
        return (uint8_t*)surface_->pixels;
    }

    inline uint8_t* Image::getDataPtr() {
        ASSERT(!isNull());
        return (uint8_t*)surface_->pixels;
    }

    inline fast_vector<uint8_t> Image::getRectData(const ARect& subrect) {
        fast_vector<uint8_t> data;
        uint32_t data_size = (uint32_t)subrect.getWidth()*(uint32_t)subrect.getHeight();
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

        uint32_t img_pitch = getPitch();
        uint32_t sub_pitch = uint32_t(subrect.getWidth() * getDepth());
        uint8_t *dest = (uint8_t*)data_out;
        uint8_t *src = (uint8_t *) getDataPtr();
        uint32_t src_pos = uint32_t(subrect.getY() * getPitch() + subrect.getX() * getDepth());
        uint32_t dst_pos = 0;
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

    inline Color Image::getPixel(uint32_t x, uint32_t y) {
        ASSERT(x < getWidth() && y<getHeight());
        uint32_t pixel = *(uint32_t*)&getDataPtr()[getPitch()*y + getDepth()*x];

        SDL_PixelFormat *f = surface_->format;
        uint32_t tmp;
        Color p;
        tmp = pixel & f->Rmask;
        tmp = tmp >> f->Rshift;
        tmp = tmp << f->Rloss;
        p.r = uint8_t(tmp);

        tmp = pixel & f->Gmask;
        tmp = tmp >> f->Gshift;
        tmp = tmp << f->Gloss;
        p.g = uint8_t(tmp);

        tmp = pixel & f->Bmask;
        tmp = tmp >> f->Bshift;
        tmp = tmp << f->Bloss;
        p.b = uint8_t(tmp);

        tmp = pixel & f->Amask;
        tmp = tmp >> f->Ashift;
        tmp = tmp << f->Aloss;
        p.a = uint8_t(tmp);

        return p;
    }

    inline void Image::setPixel(uint32_t x, uint32_t y, Color color) {
        ASSERT(x < getWidth() && y<getHeight());
        uint32_t& p = *(uint32_t*)&getDataPtr()[getPitch()*y + getDepth()*x];
        SDL_PixelFormat *f = surface_->format;
        p =     (uint32_t)color.r << f->Rshift
              | (uint32_t)color.g << f->Gshift
              | (uint32_t)color.b << f->Bshift
              | (uint32_t)color.a << f->Ashift;
    }

    inline void Image::fillWithColor(Color color) {
        ASSERT(!isNull());
        for (uint32_t x=0; x<getWidth(); ++x) {
            for (uint32_t y=0; y<getHeight(); ++y) {
                setPixel(x, y, color);
            }
        }
    }

    inline uint32_t Image::getFormatDepth(GLenum format) {
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
                return uint32_t(-1);
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
        for(uint32_t i=0;i<=255;i++){
            colors[i].r=(uint8_t)i;
            colors[i].g=(uint8_t)i;
            colors[i].b=(uint8_t)i;
            colors[i].a=255;
        }
        SDL_SetPaletteColors(p, colors, 0, 256);
        return p;
    }

    inline uint32_t Image::GLFormat2SDLFormat_(GLenum gl_format) {
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

    inline std::ostream& operator <<(std::ostream& os, const Color & p) {
        std::cout << "[" << (int)p.r << ", " << (int)p.g << ", " << (int)p.b << ", " << (int)p.a << "]";
        return os;
    }

    inline std::ostream& operator <<(std::ostream& os, const Colorf & p) {
        std::cout << "[" << p.r << ", " << p.g << ", " << p.b << ", " << p.a << "]";
        return os;
    }
}
