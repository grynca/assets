#ifndef SKYLINEPACKER_H
#define SKYLINEPACKER_H

#include "types/containers/fast_vector.h"
#include "maths/Vec2.h"

namespace grynca {

    /// based on strategy described in "Thousand Ways to Pack the Bin" by Jukka Jylanki
    // basically an inverted tetris
    // creates 1px borders between regions against sprites bleeding

    class SkylinePacker {
    public:
        static const u32 MAX_HEIGHT_NOT_SET = u32(-1);

        SkylinePacker(u32 width, u32 max_height = MAX_HEIGHT_NOT_SET );

        // returns if region fits into packer, top-left coords are returned via refs
        bool addRegion(u32 width, u32 height,
                       u32& x_out, u32& y_out);
        void clear();

        u32 getWidth()const;
        u32 getMaxHeight()const;
        u32 getUsedWidth()const;
        u32 getUsedHeight()const;
        u64 getUsedPixels()const;
        f32 getEfficiency()const;     // 0-1 on used space

    private:
        struct Segment_ {
            u32 x, y, width;
        };

        u32 fit_(u32 s_id, u32 width, u32 height);   // checks if desired width fits if stacked on skyline segment
        void merge_();      // merges skyline segments with same y

        u32 width_;
        u32 max_height_;
        u32 used_width_, used_height_;
        u64 used_pixels_;

        fast_vector<Segment_> skyline_;
    };

}

#include "SkylinePacker.inl"
#endif //SKYLINEPACKER_H
