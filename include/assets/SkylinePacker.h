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
        static const uint32_t MAX_HEIGHT_NOT_SET = uint32_t(-1);

        SkylinePacker(uint32_t width, uint32_t max_height = MAX_HEIGHT_NOT_SET );

        // returns if region fits into packer, top-left coords are returned via refs
        bool addRegion(uint32_t width, uint32_t height,
                       uint32_t& x_out, uint32_t& y_out);
        void clear();

        uint32_t getWidth()const;
        uint32_t getMaxHeight()const;
        uint32_t getUsedWidth()const;
        uint32_t getUsedHeight()const;
        uint64_t getUsedPixels()const;
        float getEfficiency()const;     // 0-1 on used space

    private:
        struct Segment_ {
            uint32_t x, y, width;
        };

        int fit_(uint32_t s_id, uint32_t width, uint32_t height);   // checks if desired width fits if stacked on skyline segment
        void merge_();      // merges skyline segments with same y

        uint32_t width_;
        uint32_t max_height_;
        uint32_t used_width_, used_height_;
        uint64_t used_pixels_;

        fast_vector<Segment_> skyline_;
    };

}

#include "SkylinePacker.inl"
#endif //SKYLINEPACKER_H
