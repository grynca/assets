#ifndef ASSETSMANAGERBASE_H
#define ASSETSMANAGERBASE_H

namespace grynca {

    // fw
    class ImagesPack;
    class FontsPack;
    class SpriteAnimations;

    class ImagePos {
    public:
        ImagePos() : tr_(NULL) {}

        u32 getTextureId()const { return texture_id_; }
        const TextureRegion* getTextureRegion()const { return tr_; }

        bool isValid() { return tr_!=NULL; }
    private:
        friend class AssetsManagerBase;
        ImagePos(u32 tid, const TextureRegion& tr) : texture_id_(tid), tr_(&tr) {}

        u32 texture_id_;
        const TextureRegion* tr_;
    };

    class AssetsManagerBase
    {
    public:
        AssetsManagerBase();
        ~AssetsManagerBase();

        ImagesPacks& getImagesPacks();
        FontsPacks& getFontsPacks();
        SpriteAnimations& getSpriteAnimations();


        ImagePos findImagePos(const std::string& image_path)const;
    private:
        ImagesPacks* images_packs_;
        FontsPacks* fonts_packs_;
        SpriteAnimations* sprite_animations_;
    };

}

#include "AssetsManagerBase.inl"
#endif //ASSETSMANAGERBASE_H
