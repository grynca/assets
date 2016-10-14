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

        static Colorf Red() {return Colorf{1.0f, 0, 0};}
        static Colorf Black() {return Colorf{0, 0, 0};}
        static Colorf White() {return Colorf{1.0f, 1.0f, 1.0f};}
        static Colorf Green() {return Colorf{0, 1.0f, 0};}
        static Colorf Blue() {return Colorf{0, 0, 1.0f};}

        friend std::ostream& operator <<(std::ostream& os, const Colorf & p);

        Colorf() {}

        constexpr Colorf(float r, float g, float b, float a = 1.0f)
                : r(r), g(g), b(b), a(a) {}

        Colorf(float* clr) {
            memcpy(c_, clr, sizeof(float)*4);
        }

        union {
            struct {
                float r;
                float g;
                float b;
                float a;
            };
            float c_[4];
        };
    };

    struct Color {

        static Color Red() {return Color{255, 0, 0};}
        static Color Black() {return Color{0, 0, 0};}
        static Color White() {return Color{255, 255, 255};}
        static Color Green() {return Color{0, 255, 0};}
        static Color Blue() {return Color{0, 0, 255};}

        friend std::ostream& operator <<(std::ostream& os, const Color & p);

        Color() {}

        constexpr Color(uint8_t r, uint8_t g, uint8_t b, uint8_t a = 255)
         : r(r), g(g), b(b), a(a) {}

        Colorf toFloat() {
            return Colorf(r/255.0f, g/255.0f, b/255.0f, a/255.0f);
        }

        void fromFloat(const Colorf& c) {
            r = (uint8_t)(c.r*255);
            g = (uint8_t)(c.g*255);
            b = (uint8_t)(c.b*255);
            a = (uint8_t)(c.a*255);
        }

        bool operator==(const Color& other) { return other.all == all;}
        bool operator!=(const Color& other) { return other.all != all;}

        union {
            struct {
                uint8_t r;
                uint8_t g;
                uint8_t b;
                uint8_t a;
            };
            uint32_t all;
        };
    };

    class Image {
    public:
        typedef RefPtr<Image> Ref;

        Image();    // dummy image
        Image(uint32_t width, uint32_t height, GLenum gl_format);   // empty image
        Image(const Path& filepath);
        Image(Image&& i);

        Image& operator=(Image&& i);

        void load(const Path& filepath);

        bool isNull()const;

        Vec2 getSize()const;
        uint32_t getWidth()const;
        uint32_t getHeight()const;
        uint8_t getDepth()const;
        uint32_t getPitch()const;

        uint8_t const* getDataPtr() const;
        uint8_t* getDataPtr();

        fast_vector<uint8_t> getRectData(const ARect& subrect);
        void copyRectOut(const ARect& subrect, void* data_out);

        GLenum getGLFormat() const;
        bool convertTo(GLenum gl_format);
        bool saveToPNG(const Path& filepath);

        SDL_Surface* getInternal();

        Color getPixel(uint32_t x, uint32_t y);
        void setPixel(uint32_t x, uint32_t y, Color color);

        void fillWithColor(Color color);

        static uint32_t getFormatDepth(GLenum format);
    private:
        friend class RefPtr<Image>;

        Image(const Image&) = delete;
        Image& operator=(const Image&) = delete;
        ~Image();

        void setImage_(const Path& filepath);
        SDL_Palette* createGreyscalePalette_();
        uint32_t GLFormat2SDLFormat_(GLenum gl_format);

        SDL_Surface* surface_;
        std::bitset<1> flags_;      // 0.. gl_alpha
    };
}

#include "Image.inl"
#endif //IMAGE_H
