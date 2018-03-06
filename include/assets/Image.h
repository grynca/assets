#ifndef IMAGE_H
#define IMAGE_H

#include "types/containers/fast_vector.h"
#include "types/Path.h"
#include "types/RefPtr.h"
#include "maths/shapes/ARect.h"
#include <SDL2/SDL.h>
#include <GL/glew.h>
#include <stdint.h>
#include <string>
#include <bitset>

namespace grynca {

    struct Colorf {

        static constexpr Colorf Red() {return Colorf{1.0f, 0, 0};}
        static constexpr Colorf Black() {return Colorf{0, 0, 0};}
        static constexpr Colorf White() {return Colorf{1.0f, 1.0f, 1.0f};}
        static constexpr Colorf Green() {return Colorf{0, 1.0f, 0};}
        static constexpr Colorf Olive() {return Colorf(0.3125f, 0.3125f, 0);}
        static constexpr Colorf Blue() {return Colorf{0, 0, 1.0f};}
        static constexpr Colorf Yellow() {return Colorf{1.0f, 1.0f, 0};}
        static constexpr Colorf Orange() {return Colorf{1.0f, 0.4f, 0};}
        static constexpr Colorf DarkGreen() {return Colorf{0, 0.392156863f, 0};}
        static constexpr Colorf Grey() {return Colorf{0.5f, 0.5f, 0.5f};}
        static constexpr Colorf Brown() {return Colorf{0.543f, 0.2695f, 0.0742f};}
        static constexpr Colorf SkinLight() {return Colorf{1.0f, 0.85547f, 0.671875f};}

        friend std::ostream& operator <<(std::ostream& os, const Colorf & p);

        Colorf() {}

        constexpr Colorf(f32 r, f32 g, f32 b, f32 a = 1.0f)
                : r(r), g(g), b(b), a(a) {}

        Colorf(f32* clr) {
            memcpy(c_, clr, sizeof(f32)*4);
        }

        union {
            struct {
                f32 r;
                f32 g;
                f32 b;
                f32 a;
            };
            f32 c_[4];
        };
    };

    struct Color {

        static constexpr Color Red() {return Color{255, 0, 0};}
        static constexpr Color Black() {return Color{0, 0, 0};}
        static constexpr Color White() {return Color{255, 255, 255};}
        static constexpr Color Green() {return Color{0, 255, 0};}
        static constexpr Color Olive() {return Color(80, 80, 0);}
        static constexpr Color Blue() {return Color{0, 0, 255};}
        static constexpr Color Yellow() {return Color{255, 255, 0};}
        static constexpr Color Orange() {return Color{255, 102, 0};}
        static constexpr Color DarkGreen() {return Color{0, 100, 0};}
        static constexpr Color Grey() {return Color{128, 128, 128};}
        static constexpr Color Brown() {return Color{139, 69, 19};}
        static constexpr Color SkinLight() {return Color{255, 219, 172};}

        friend std::ostream& operator <<(std::ostream& os, const Color & p);

        Color() : all(u32(-1)) {}

        constexpr Color(u8 r, u8 g, u8 b, u8 a = 255)
         : r(r), g(g), b(b), a(a) {}

        Colorf toFloat() {
            return Colorf(r/255.0f, g/255.0f, b/255.0f, a/255.0f);
        }

        void fromFloat(const Colorf& c) {
            r = (u8)(c.r*255);
            g = (u8)(c.g*255);
            b = (u8)(c.b*255);
            a = (u8)(c.a*255);
        }

        bool operator==(const Color& other) { return other.all == all;}
        bool operator!=(const Color& other) { return other.all != all;}

        union {
            struct {
                u8 r;
                u8 g;
                u8 b;
                u8 a;
            };
            u32 all;
        };
    };

    class Image {
    public:
        typedef RefPtr<Image> Ref;

        Image();    // dummy image
        Image(u32 width, u32 height, GLenum gl_format);   // empty image
        Image(const Path& filepath);
        Image(Image&& i);

        Image& operator=(Image&& i);

        void load(const Path& filepath);

        bool isNull()const;

        Vec2 getSize()const;
        u32 getWidth()const;
        u32 getHeight()const;
        u8 getDepth()const;
        u32 getPitch()const;

        const u8* getDataPtr() const;
        u8* getDataPtr();

        fast_vector<u8> getRectData(const ARect& subrect);
        void copyRectOut(const ARect& subrect, void* data_out);

        GLenum getGLFormat() const;
        bool convertTo(GLenum gl_format);
        bool saveToPNG(const Path& filepath);

        SDL_Surface* getInternal();

        Color getPixel(u32 x, u32 y);
        void setPixel(u32 x, u32 y, Color color);

        void fillWithColor(Color color);

        static u32 getFormatDepth(GLenum format);
    private:
        friend class RefPtr<Image>;

        Image(const Image&) = delete;
        Image& operator=(const Image&) = delete;
        ~Image();

        void setImage_(const Path& filepath);
        SDL_Palette* createGreyscalePalette_();
        u32 GLFormat2SDLFormat_(GLenum gl_format);
        u32 getPixel_(u32 x, u32 y);
        void setPixel_(u32 x, u32 y, u32 pixel_val);

        SDL_Surface* surface_;
        std::bitset<1> flags_;      // 0.. gl_alpha
    };
}

#include "Image.inl"
#endif //IMAGE_H
