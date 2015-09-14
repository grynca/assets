#include "SkylinePacker.h"

namespace grynca {

    inline SkylinePacker::SkylinePacker(uint32_t width, uint32_t max_height)
     : width_(width), max_height_(max_height), used_width_(0), used_height_(0), used_pixels_(0)
    {
        skyline_.push_back({0, 0, width_});
    }

    inline bool SkylinePacker::addRegion(uint32_t width, uint32_t height, uint32_t& x_out, uint32_t& y_out) {
        if (width > width_)
            return false;

        // border agains bleeding
        width +=2;
        height +=2;

        uint32_t best_height = std::numeric_limits<uint32_t>::max();
        uint32_t best_width = std::numeric_limits<uint32_t>::max();
        int best_index = -1;
        x_out = y_out = 0;

        for(uint32_t i=0; i<skyline_.size(); ++i) {
            int y = fit_(i, width, height);

            if(y >= 0) {
                Segment_& segm = skyline_[i];
                if( ( (y + height) < best_height ) ||
                    ( ((y + height) == best_height) && (segm.width < best_width)) )
                {
                    best_height = y + height;
                    best_index = i;
                    best_width = segm.width;
                    x_out = segm.x;
                    y_out = uint32_t(y);
                }
            }
        }
        if (best_index == -1)
            return false;

        skyline_.insert(skyline_.begin()+best_index, Segment_{x_out, (y_out+height), width});

        for(uint32_t i = uint32_t(best_index)+1; i < skyline_.size(); ++i) {
            Segment_& segm = skyline_[i];
            Segment_& prev = skyline_[i-1];

            if (segm.x < (prev.x + prev.width) ) {
                int shrink = prev.x + prev.width - segm.x;
                segm.x += shrink;
                int32_t w = segm.width - shrink;
                if (w <= 0) {

                    skyline_.erase(skyline_.begin()+i);
                    --i;
                }
                else {
                    segm.width = uint32_t(w);
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

    inline uint32_t SkylinePacker::getWidth()const {
        return width_;
    }

    inline uint32_t SkylinePacker::getMaxHeight()const {
        return max_height_;
    }

    inline uint32_t SkylinePacker::getUsedWidth()const {
        return used_width_;
    }

    inline uint32_t SkylinePacker::getUsedHeight()const {
        return used_height_;
    }

    inline uint64_t SkylinePacker::getUsedPixels()const {
        return used_pixels_;
    }

    inline float SkylinePacker::getEfficiency()const {
        return used_pixels_/(used_width_*used_height_);
    }

    inline int SkylinePacker::fit_(uint32_t s_id, uint32_t width, uint32_t height) {
        Segment_& segm = skyline_[s_id];
        int x = segm.x;
        if ((x+width) > (width_))
            return -1;
        int y = segm.y;
        if (max_height_ > 0 && (y+height) > (max_height_))
            return -1;
        int width_left = width;
        int i = s_id;

        while( width_left > 0 ) {
            Segment_& s= skyline_[i];
            if( s.y > y ) {
                y = s.y;
            }
            if (max_height_ > 0 && (y+height) > (max_height_))
                return -1;
            width_left -= s.width;
            ++i;
        }
        return y;
    }

    inline void SkylinePacker::merge_() {
        for(uint32_t i=0; i< skyline_.size()-1; ++i) {
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