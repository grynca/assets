#ifndef ASSETSMANAGER_H
#define ASSETSMANAGER_H

#include "ImagesPacks.h"
#include "FontsPacks.h"
#include "Animations.h"


namespace grynca {

    class AssetsManager
    {
    public:
        AssetsManager()
         : images_packs_(*this), fonts_packs_(*this), animations_(*this)
        {}

        ImagesPacks& getImagesPacks() { return images_packs_; }
        FontsPacks& getFontsPacks() { return fonts_packs_; }
        Animations& getAnimations() { return animations_; }


        const TextureRegion* getImageRegion(const std::string& image_path)const;
    private:
        ImagesPacks images_packs_;
        FontsPacks fonts_packs_;
        Animations animations_;
    };

}

#include "AssetsManager.inl"
#endif //ASSETSMANAGER_H
