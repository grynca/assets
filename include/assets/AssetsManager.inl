#include "AssetsManager.h"
#include "ImagesPacks.h"
#include "FontsPacks.h"
#include "SpriteAnimations.h"
#include "ImagesPack.h"

namespace grynca {

    inline AssetsManager::AssetsManager() {
        images_packs_ = new ImagesPacks(*this);
        fonts_packs_ = new FontsPacks(*this);
        sprite_animations_ = new SpriteAnimations(*this);
    }

    inline AssetsManager::~AssetsManager() {
        delete images_packs_;
        delete fonts_packs_;
        delete sprite_animations_;
    }

    inline ImagesPacks& AssetsManager::getImagesPacks() {
        return *images_packs_;
    }

    inline FontsPacks& AssetsManager::getFontsPacks() {
        return *fonts_packs_;
    }

    inline SpriteAnimations& AssetsManager::getSpriteAnimations() {
        return *sprite_animations_;
    }

    inline const TextureRegion* AssetsManager::getImageRegion(const std::string& image_path)const {
        for (u32 i=0; i<images_packs_->getItemsCount(); ++i) {
            const ImagesPack* pack = images_packs_->getItemAtPos(i);
            if (!pack)
                continue;
            const ImagesPack::Regions& rs = pack->getRegions();
            ImagesPack::Regions::const_iterator it = rs.find(image_path);
            if (it!=rs.end())
                return &it->second;
        }
        return NULL;
    }
}