#include "AssetsManagerBase.h"
#include "ImagesPacks.h"
#include "FontsPacks.h"
#include "SpriteAnimations.h"
#include "ImagesPack.h"

namespace grynca {

    inline AssetsManagerBase::AssetsManagerBase() {
        images_packs_ = new ImagesPacks(*this);
        fonts_packs_ = new FontsPacks(*this);
        sprite_animations_ = new SpriteAnimations(*this);
    }

    inline AssetsManagerBase::~AssetsManagerBase() {
        delete images_packs_;
        delete fonts_packs_;
        delete sprite_animations_;
    }

    inline ImagesPacks& AssetsManagerBase::getImagesPacks() {
        return *images_packs_;
    }

    inline FontsPacks& AssetsManagerBase::getFontsPacks() {
        return *fonts_packs_;
    }

    inline SpriteAnimations& AssetsManagerBase::getSpriteAnimations() {
        return *sprite_animations_;
    }

    inline ImagePos AssetsManagerBase::findImagePos(const std::string& image_path)const {
        for (u32 i=0; i<images_packs_->getItemsCount(); ++i) {
            const ImagesPack* pack = images_packs_->getItemAtPos(i);
            if (!pack)
                continue;
            const ImagesPack::Regions& rs = pack->getRegions();
            ImagesPack::Regions::const_iterator it = rs.find(image_path);
            if (it!=rs.end())
                return ImagePos(pack->getTextureId(), it->second);
        }
        return ImagePos();
    }
}