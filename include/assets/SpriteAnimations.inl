#include "SpriteAnimations.h"
#include "SpriteAnimation.h"

namespace grynca {

    inline SpriteAnimations::SpriteAnimations(AssetsManager& am)
     : manager_(&am)
     {
     }

    inline AssetsManager& SpriteAnimations::getManager() {
        return *manager_;
    }
}