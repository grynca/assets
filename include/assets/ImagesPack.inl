#include "ImagesPack.h"
#include "ImagesPacks.h"
#include "types/FileLister.h"
#include "functions/sort_utils.h"

namespace grynca {

    inline ImagesPack::ImagesPack() {}

    inline ImagesPack::ImagesPack(const Path& dir_path, GLenum format, u32 texture_w) {
        loadDir(dir_path, format, texture_w);
    }

    inline bool ImagesPack::isNull() {
        return pack_image_->isNull();
    }

    inline Image::Ref ImagesPack::getPackImage() {
        return pack_image_;
    }

    inline Image::Ref ImagesPack::getImage(const Path& image_path) {
        Regions::iterator it = regions_.find(image_path.getPath());
        if (it == regions_.end())
            return new Image();
        const ARect& rect = it->second.getRect();
        return getRectImage_(rect);
    }

    inline bool ImagesPack::loadDir(const Path& dir_path, GLenum format, u32 texture_w) {
        regions_.clear();

        TexturePacker packer(texture_w, format);
        FileLister lister(dir_path, {"jpg", "png", "bmp"}, true);

        Path filepath;
        fast_vector<Image::Ref> images;
        fast_vector<Path> paths;

        while (lister.nextFile(filepath)) {
            paths.push_back(filepath);
            images.emplace_back(new Image(filepath));
            images.back()->convertTo(format);
        }

        // sort images by height
        fast_vector<unsigned int> order;
        indirectSort(images.begin(), images.end(), order, cmpImagesHeightDesc_);

        // add regions to packer
        for (size_t i=0; i<order.size(); ++i) {
            Image& img = images[order[i]].get();
            u32 reg_id = packer.addRegion(img.getWidth(), img.getHeight(), img.getDataPtr());
            if ( reg_id == InvalidId()) {
                Path& path = paths[order[i]];
                std::cerr << "Image " << path << " does not fit into texture." << std::endl;
                return false;
            }
        }

        pack_image_ = new Image(packer.getTextureWidth(), packer.getTextureHeight(), format);
        pack_image_->fillWithColor({0, 0, 0, 0});
        packer.packData(pack_image_->getDataPtr(), pack_image_->getPitch());
        // gather regions
        for (size_t i=0; i<order.size(); ++i) {
            Path& path = paths[order[i]];
            regions_[path.getPath()] = packer.getRegions()[i];
        }
        return true;
    }

    inline const ImagesPack::Regions& ImagesPack::getRegions()const {
        return regions_;
    }

    inline Image::Ref ImagesPack::getRectImage_(const ARect& r) {
        Image::Ref img = new Image((u32)r.getWidth(), (u32)r.getHeight(), pack_image_->getGLFormat());
        pack_image_->copyRectOut(r, img->getDataPtr());
        img->convertTo(pack_image_->getGLFormat());
        return img;
    }

    inline bool ImagesPack::cmpImagesHeightDesc_(const Image::Ref& i1, const Image::Ref& i2) {
        // static
        return i1->getHeight()>i2->getHeight();
    }

}