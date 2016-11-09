#include "SkylinePacker.h"
#include "types/Index.h"

namespace grynca {

    inline SkylinePacker::SkylinePacker(u32 width, u32 max_height)
     : width_(width), max_height_(max_height), used_width_(0), used_height_(0), used_pixels_(0)
    {
        skyline_.push_back({0, 0, width_});
    }

    inline bool SkylinePacker::addRegion(u32 width, u32 height, u32& x_out, u32& y_out) {
        if (width > width_)
            return false;

        // border agains bleeding
        width +=2;
        height +=2;

        u32 best_height = std::numeric_limits<u32>::max();
        u32 best_width = std::numeric_limits<u32>::max();
        int best_index = -1;
        x_out = y_out = 0;

        for(u32 i=0; i<skyline_.size(); ++i) {
            u32 y = fit_(i, width, height);

            if(y != InvalidId()) {
                Segment_& segm = skyline_[i];
                if( ( (y + height) < best_height ) ||
                    ( ((y + height) == best_height) && (segm.width < best_width)) )
                {
                    best_height = y + height;
                    best_index = i;
                    best_width = segm.width;
                    x_out = segm.x;
                    y_out = u32(y);
                }
            }
        }
        if (best_index == -1)
            return false;

        skyline_.insert(skyline_.begin()+best_index, Segment_{x_out, (y_out+height), width});

        for(u32 i = u32(best_index)+1; i < skyline_.size(); ++i) {
            Segment_& segm = skyline_[i];
            Segment_& prev = skyline_[i-1];

            if (segm.x < (prev.x + prev.width) ) {
                int shrink = prev.x + prev.width - segm.x;
                segm.x += shrink;
                i32 w = segm.width - shrink;
                if (w <= 0) {

                    skyline_.erase(skyline_.begin()+i);
                    --i;
                }
                else {
                    segm.width = u32(w);
                    break;
                }
            }
            else
                break;
        }
        merge_();
        used_pixels_ += width * height;
        if ((y_out+height) > used_height_)
            used_height_ = (y_out+height);
        if ((x_out+width) > used_width_)
            used_width_ = (x_out+width);

        // move after border agains bleeding
        ++x_out;
        ++y_out;

        return true;

    }

    inline void SkylinePacker::clear() {
        used_width_ = 0;
        used_height_ = 0;
        used_pixels_ = 0;
        skyline_.clear();
        skyline_.push_back({0, 0, width_}); // add default skyline (single segment line on top)
    }

    inline u32 SkylinePacker::getWidth()const {
        return width_;
    }

    inline u32 SkylinePacker::getMaxHeight()const {
        return max_height_;
    }

    inline u32 SkylinePacker::getUsedWidth()const {
        return used_width_;
    }

    inline u32 SkylinePacker::getUsedHeight()const {
        return used_height_;
    }

    inline u64 SkylinePacker::getUsedPixels()const {
        return used_pixels_;
    }

    inline f32 SkylinePacker::getEfficiency()const {
        return used_pixels_/(used_width_*used_height_);
    }

    inline u32 SkylinePacker::fit_(u32 s_id, u32 width, u32 height) {
        Segment_& segm = skyline_[s_id];
        u32 x = segm.x;
        if ((x+width) > (width_))
            return InvalidId();
        u32 y = segm.y;
        if (max_height_ > 0 && (y+height) > (max_height_))
            return InvalidId();
        int width_left = width;
        int i = s_id;

        while( width_left > 0 ) {
            Segment_& s= skyline_[i];
            if( s.y > y ) {
                y = s.y;
            }
            if (max_height_ > 0 && (y+height) > (max_height_))
                return InvalidId();
            width_left -= s.width;
            ++i;
        }
        return y;
    }

    inline void SkylinePacker::merge_() {
        for(u32 i=0; i< skyline_.size()-1; ++i) {
            Segment_& segm = skyline_[i];
            Segment_& next = skyline_[i+1];
            if (segm.y == next.y) {
                segm.width += next.width;
                skyline_.erase(skyline_.begin()+(i+1));
                --i;
            }
        }
    }

}