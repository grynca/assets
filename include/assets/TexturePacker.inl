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

    inline TexturePacker::TexturePacker(uint32_t width, GLenum format, uint32_t max_height)
     : packer_(width, max_height), format_(format), depth_(Image::getFormatDepth(format))
    {
    }

    inline TexturePacker::~TexturePacker() {
        clear();
    }

    inline void TexturePacker::clear() {
        for (uint32_t i=0; i<region_data_.size(); ++i) {
            if (data_owned_[i])
                delete region_data_[i];
        }
        region_data_.clear();
        data_owned_.clear();
        regions_.clear();
    }

    inline int TexturePacker::addRegion(uint32_t width, uint32_t height, void* data, bool copy_data_inside) {
        uint32_t reg_x, reg_y;
        if (!packer_.addRegion(width, height, reg_x, reg_y)) {
            return -1;
        }
        data_owned_.push_back(copy_data_inside);
        if (copy_data_inside) {
            uint32_t data_size = width*height*depth_;
            uint8_t* data_copy = new uint8_t[data_size];
            memcpy(data_copy, data, data_size);
            region_data_.push_back(data_copy);
        }
        else {
            region_data_.push_back((uint8_t*)data);
        }
        int reg_id = (int)regions_.size();
        regions_.emplace_back();
        ARect rect(Vec2(reg_x, reg_y), Vec2(width, height));
        regions_.back().setRect(rect);
        return reg_id;
    }

    inline void TexturePacker::packData(void* dest, uint32_t dst_pitch, bool flip_y) {
        uint32_t atlas_w = getTextureWidth();
        uint32_t atlas_h = getTextureHeight();
        if (atlas_w==0 || atlas_h==0)
            return;
        int dest_pos_advancement;
        if (flip_y)
            dest_pos_advancement = -dst_pitch;
        else
            dest_pos_advancement = dst_pitch;
        uint8_t* d = (uint8_t*)dest;
        for (uint32_t i=0; i<regions_.size(); ++i) {
            TextureRegion& reg = regions_[i];
            reg.setTC(Vec2(atlas_w, atlas_h), flip_y);
            uint32_t reg_x = uint32_t(reg.getRect().getX());
            uint32_t reg_y = uint32_t(reg.getRect().getY());
            uint32_t reg_w = uint32_t(reg.getRect().getWidth());
            uint32_t reg_h = uint32_t(reg.getRect().getHeight());
            size_t reg_stride = reg_w*depth_;
            size_t dest_pos;
            if (flip_y) {
                dest_pos = dst_pitch*(atlas_h-reg_y-1) + reg_x*depth_;
            }
            else {
                dest_pos = reg_y*dst_pitch + reg_x*depth_;
            }
            for (uint32_t j=0; j<reg_h; ++j) {
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

    inline uint32_t TexturePacker::getTextureWidth()const {
        return nextPow2_(packer_.getUsedWidth());
    }

    inline uint32_t TexturePacker::getTextureHeight()const {
        return nextPow2_(packer_.getUsedHeight());
    }

    inline GLenum TexturePacker::getFormat()const {
        return format_;
    }

    inline uint32_t TexturePacker::getDepth()const {
        return depth_;
    }

    inline uint32_t TexturePacker::nextPow2_(uint32_t num)const {
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