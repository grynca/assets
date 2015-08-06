#ifndef IMAGE_H
#define IMAGE_H

#include "types/containers/fast_vector.h"
#include "types/RefPtr.h"
#include "maths/shapes/ARect.h"
#include <SDL.h>
#include <GL/glew.h>
#include <stdint.h>
#include <string>

namespace grynca {

    struct Pixel {
        friend std::ostream& operator <<(std::ostream& os, const Pixel& p);

        uint8_t r;
        uint8_t g;
        uint8_t b;
        uint8_t a;
    };

    class Image {
    public:
        typedef RefPtr<Image> Ref;

        Image();    // dummy image
        Image(uint32_t width, uint32_t height, GLenum gl_format);   // empty image
        Image(const std::string& filepath);
        Image(Image&& i);
        ~Image();

        void load(const std::string& filepath);

        bool isNull()const;

        Vec2 getSize()const;
        uint32_t getWidth()const;
        uint32_t getHeight()const;
        uint8_t getDepth()const;
        uint32_t getPitch()const;

        uint8_t const* getDataPtr() const;
        uint8_t* getDataPtr();

        fast_vector<uint8_t> getRectData(const ARect& subrect);     // copies data out

        GLenum getGLFormat() const;
        bool convertTo(GLenum gl_format);
        bool saveToPNG(const std::string& filepath);

        SDL_Surface* getInternal();

        Pixel getPixel(uint32_t x, uint32_t y);
        void setPixel(uint32_t x, uint32_t y, Pixel pixel);
    private:
        Image(const Image&) = delete;
        Image& operator=(const Image&) = delete;

        void setImage_(const std::string& filepath);
        SDL_Palette* createGreyscalePalette_();
        uint32_t GLFormat2SDLFormat_(GLenum gl_format);

        SDL_Surface* surface_;
    };
}

#include "Image.inl"
#endif //IMAGE_H
