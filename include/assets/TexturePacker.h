#ifndef TEXTUREPACKER_H
#define TEXTUREPACKER_H

#include "types/containers/fast_vector.h"
#include "maths/shapes/ARect.h"
#include "SkylinePacker.h"
#include <GL/glew.h>

namespace grynca {

    class TextureRegion {
    public:
        const ARect& getRect()const;
        void setRect(const ARect& r);

        // 0-1 texture coords
        const ARect& getTextureRect()const;
        void setTextureRect(const ARect& r);

        void setTC(const Vec2& texture_size, bool flip_y = false);
    private:
        ARect rect_;
        ARect texture_rect_;
    };

    class TexturePacker {
    public:
        TexturePacker(uint32_t width, GLenum format, uint32_t max_height = SkylinePacker::MAX_HEIGHT_NOT_SET);
        ~TexturePacker();
        void clear();

        //  returns region id or -1 when region does not fit into packer
        //  data must contain width*height*depth bytes
        int addRegion(uint32_t width, uint32_t height, void* data, bool copy_data_inside = false);

        // packs data to buffer
        void packData(void* dest, uint32_t dst_pitch, bool flip_y = false);

        const fast_vector<TextureRegion>& getRegions()const;
        uint32_t getTextureWidth()const;
        uint32_t getTextureHeight()const;

        GLenum getFormat()const;
        uint32_t getDepth()const;
    private:

        uint32_t nextPow2_(uint32_t num)const;

        SkylinePacker packer_;
        GLenum format_;
        uint32_t depth_;

        fast_vector<TextureRegion> regions_;
        fast_vector<uint8_t*> region_data_;
        fast_vector<bool> data_owned_;
    };

}


#include "TexturePacker.inl"
#endif //TEXTUREPACKER_H
