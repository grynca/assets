#include "TexturePacker.h"
#include "Image.h"

namespace grynca {

    inline const ARect& TextureRegion::getRect()const {
        return rect_;
    }

    inline void TextureRegion::setRect(const ARect& r) {
        rect_ = r;
    }

    inline const ARect& TextureRegion::getTextureRect()const {
        return texture_rect_;
    }

    inline void TextureRegion::setTextureRect(const ARect& r) {
        texture_rect_ = r;
    }

    inline void TextureRegion::setTC(const Vec2& texture_size, bool flip_y) {
        Vec2 lt;
        Vec2 rb;
        lt.setX(rect_.getX()/texture_size.getX());
        rb.setX(lt.getX() + rect_.getWidth()/texture_size.getX());
        if (flip_y) {
            lt.setY(1.0f -rect_.getY()/texture_size.getY());
            rb.setY(lt.getY() - rect_.getHeight()/texture_size.getY());
        }
        else {
            lt.setY(rect_.getY()/texture_size.getY());
            rb.setY(lt.getY() + rect_.getHeight()/texture_size.getY());
        }
        texture_rect_.setLeftTop(lt);
        texture_rect_.setSize(rb-lt);
    }

    inline TexturePacker::TexturePacker(u32 width, GLenum format, u32 max_height)
     : packer_(width, max_height), format_(format), depth_(Image::getFormatDepth(format))
    {
    }

    inline TexturePacker::~TexturePacker() {
        clear();
    }

    inline void TexturePacker::clear() {
        for (u32 i=0; i<region_data_.size(); ++i) {
            if (data_owned_[i])
                delete region_data_[i];
        }
        region_data_.clear();
        data_owned_.clear();
        regions_.clear();
    }

    inline u32 TexturePacker::addRegion(u32 width, u32 height, void* data, bool copy_data_inside) {
        u32 reg_x, reg_y;
        if (!packer_.addRegion(width, height, reg_x, reg_y)) {
            return InvalidId();
        }
        data_owned_.push_back(copy_data_inside);
        if (copy_data_inside) {
            u32 data_size = width*height*depth_;
            u8* data_copy = new u8[data_size];
            memcpy(data_copy, data, data_size);
            region_data_.push_back(data_copy);
        }
        else {
            region_data_.push_back((u8*)data);
        }
        u32 reg_id = regions_.size();
        regions_.emplace_back();
        ARect rect(Vec2(reg_x, reg_y), Vec2(width, height));
        regions_.back().setRect(rect);
        return reg_id;
    }

    inline void TexturePacker::packData(void* dest, u32 dst_pitch, bool flip_y) {
        u32 atlas_w = getTextureWidth();
        u32 atlas_h = getTextureHeight();
        if (atlas_w==0 || atlas_h==0)
            return;
        int dest_pos_advancement;
        if (flip_y)
            dest_pos_advancement = -dst_pitch;
        else
            dest_pos_advancement = dst_pitch;
        u8* d = (u8*)dest;
        for (u32 i=0; i<regions_.size(); ++i) {
            TextureRegion& reg = regions_[i];
            reg.setTC(Vec2(atlas_w, atlas_h), flip_y);
            u32 reg_x = u32(reg.getRect().getX());
            u32 reg_y = u32(reg.getRect().getY());
            u32 reg_w = u32(reg.getRect().getWidth());
            u32 reg_h = u32(reg.getRect().getHeight());
            size_t reg_stride = reg_w*depth_;
            size_t dest_pos;
            if (flip_y) {
                dest_pos = dst_pitch*(atlas_h-reg_y-1) + reg_x*depth_;
            }
            else {
                dest_pos = reg_y*dst_pitch + reg_x*depth_;
            }
            for (u32 j=0; j<reg_h; ++j) {
                // copy by rows
                size_t src_pos = j*reg_stride;
                memcpy(&d[dest_pos], &region_data_[i][src_pos], reg_stride);
                dest_pos += dest_pos_advancement;
            }
        }
    }

    inline const fast_vector<TextureRegion>& TexturePacker::getRegions()const {
        return regions_;
    }

    inline u32 TexturePacker::getTextureWidth()const {
        return nextPow2_(packer_.getUsedWidth());
    }

    inline u32 TexturePacker::getTextureHeight()const {
        return nextPow2_(packer_.getUsedHeight());
    }

    inline GLenum TexturePacker::getFormat()const {
        return format_;
    }

    inline u32 TexturePacker::getDepth()const {
        return depth_;
    }

    inline u32 TexturePacker::nextPow2_(u32 num)const {
        num--;
        num |= num >> 1;
        num |= num >> 2;
        num |= num >> 4;
        num |= num >> 8;
        num |= num >> 16;
        num++;
        return num;
    }

}