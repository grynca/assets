#include "ImagesPack.h"
#include "ImagesPacks.h"
#include "types/FileLister.h"
#include "functions/sort_utils.h"

namespace grynca {

    inline ImagesPack::ImagesPack() {}

    inline ImagesPack::ImagesPack(const DirPath& dir_path, GLenum format, u32 texture_w) {
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

    inline bool ImagesPack::loadDir(const DirPath& dir_path, GLenum format, u32 texture_w) {
        regions_.clear();

        TexturePacker packer(texture_w, format);
        FileLister lister(dir_path, {"jpg", "png", "bmp"}, true);

        Path filepath;
        fast_vector<ImgWithPadding> images;
        fast_vector<Path> paths;

        while (lister.nextFile(filepath)) {
            images.emplace_back(new Image(filepath));
            paths.push_back(filepath);
            images.back().image->convertTo(format);

            std::string name = filepath.getFilenameWOExtension();
            if (name.rfind("_rp") != std::string::npos) {
                Vec2 img_size = images.back().image->getSize();
                f32 diag = sqrtf(2)*std::max(img_size.getX(), img_size.getY());
                u32 hor_pad = u32(std::ceil((diag-img_size.getX())*0.5f));
                u32 ver_pad = u32(std::ceil((diag-img_size.getY())*0.5f));
                images.back().left = hor_pad;
                images.back().right = hor_pad;
                images.back().top = ver_pad;
                images.back().bottom = ver_pad;
            }
        }

        // sort images by height
        fast_vector<u32> order;
        indirectSort(images.begin(), images.end(), order, [](const ImgWithPadding& i1, const ImgWithPadding& i2) {
            return (i1.image->getHeight()+i1.top+i1.bottom) > (i2.image->getHeight()+i2.top+i2.bottom);
        });

        // add regions to packer
        for (size_t i=0; i<order.size(); ++i) {
            ImgWithPadding& iwp = images[order[i]];
            Image& img = iwp.image.get();
            u32 reg_id = packer.addPaddedRegion(img.getWidth(), img.getHeight(), iwp.left, iwp.top, iwp.right, iwp.bottom, img.getDataPtr());
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