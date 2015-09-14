#include "AssetsManager.h"
#include "ImagesPack.h"

namespace grynca {

    inline const TextureRegion* AssetsManager::getImageRegion(const std::string& image_path)const {
        for (uint32_t i=0; i<images_packs_.getItemsCount(); ++i) {
            const ImagesPack::Regions& rs = images_packs_.getItemAtPos(i).getRegions();
            ImagesPack::Regions::const_iterator it = rs.find(image_path);
            if (it!=rs.end())
                return &it->second;
        }
        return NULL;
    }
}