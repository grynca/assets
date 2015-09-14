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

    struct Color {
        friend std::ostream& operator <<(std::ostream& os, const Color & p);

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
