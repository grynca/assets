#include "AssetsManager.h"
#include "ImagesPack.h"

namespace grynca {

    inline const TextureRegion* AssetsManager::getImageRegion(const std::string& image_path)const {
        for (u32 i=0; i<images_packs_.getItemsCount(); ++i) {
            const ImagesPack* pack = images_packs_.getItemAtPos(i);
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