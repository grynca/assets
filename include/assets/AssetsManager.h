#ifndef ASSETSMANAGER_H
#define ASSETSMANAGER_H

namespace grynca {

    // fw
    class ImagesPack;
    class FontsPack;
    class SpriteAnimations;

    class AssetsManager
    {
    public:
        AssetsManager();
        ~AssetsManager();

        ImagesPacks& getImagesPacks();
        FontsPacks& getFontsPacks();
        SpriteAnimations& getSpriteAnimations();


        const TextureRegion* getImageRegion(const std::string& image_path)const;
    private:
        ImagesPacks* images_packs_;
        FontsPacks* fonts_packs_;
        SpriteAnimations* sprite_animations_;
    };

}

#include "AssetsManager.inl"
#endif //ASSETSMANAGER_H
