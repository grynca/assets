#include "SpriteAnimations.h"
#include "SpriteAnimation.h"

namespace grynca {

    inline SpriteAnimations::SpriteAnimations(AssetsManagerBase& am)
     : manager_(&am)
     {
     }

    inline AssetsManagerBase& SpriteAnimations::getManager() {
        return *manager_;
    }
}