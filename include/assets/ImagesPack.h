#ifndef IMAGESPACK_H_H
#define IMAGESPACK_H_H

#include "types/Manager.h"
#include "Image.h"
#include "TexturePacker.h"
#include "types/Path.h"
#include <unordered_map>

namespace grynca {

    // fw
    class ImagesPacks;

    class ImagesPack : public ManagedItem<ImagesPacks> {
    public:
        typedef std::unordered_map<std::string, TextureRegion> Regions;

        ImagesPack();
        ImagesPack(const DirPath& dir_path, GLenum format, u32 texture_w = 2048);     // loads dir immediatelly

        bool isNull();
        Image::Ref getPackImage();
        Image::Ref getImage(const Path& image_path);

        /* recursively loads images/animations from directory
          images will be named with their relative path to dir
          clears previous pack content
            special name suffixes (before extension):
                _rp (rotation padding): pads around with empty space - for particles
         */
        bool loadDir(const DirPath& dir_path, GLenum format, u32 texture_w = 2048);

        const Regions& getRegions()const;
    private:
        struct ImgWithPadding {
            ImgWithPadding(Image* img) : image(img), left(0), top(0), right(0), bottom(0) {}

            Image::Ref image;
            u32 left;
            u32 top;
            u32 right;
            u32 bottom;
        };

        Image::Ref getRectImage_(const ARect& r);
        static bool cmpImagesHeightDesc_(const Image::Ref& i1, const Image::Ref& i2);

        Image::Ref pack_image_;
        Regions regions_;
    };

}

#include "ImagesPack.inl"
#endif //IMAGESPACK_H_H
