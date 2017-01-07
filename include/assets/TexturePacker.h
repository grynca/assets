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
        TexturePacker(u32 width, GLenum format, u32 max_height = SkylinePacker::MAX_HEIGHT_NOT_SET);
        ~TexturePacker();
        void clear();

        //  returns region id or InvalidId() when region does not fit into packer
        //  data must contain width*height*depth bytes
        u32 addRegion(u32 width, u32 height, void* data, bool copy_data_inside = false);

        u32 addPaddedRegion(u32 width, u32 height, u32 left_pad, u32 top_pad, u32 right_pad, u32 bot_pad,
                            void* data, bool copy_data_inside = false);

        // packs data to buffer
        void packData(void* dest, u32 dst_pitch, bool flip_y = false);

        const fast_vector<TextureRegion>& getRegions()const;
        u32 getTextureWidth()const;
        u32 getTextureHeight()const;

        GLenum getFormat()const;
        u32 getDepth()const;
    private:

        u32 nextPow2_(u32 num)const;

        SkylinePacker packer_;
        GLenum format_;
        u32 depth_;

        fast_vector<TextureRegion> regions_;
        fast_vector<u8*> region_data_;
        fast_vector<bool> data_owned_;
    };

}


#include "TexturePacker.inl"
#endif //TEXTUREPACKER_H
