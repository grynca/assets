#ifndef ANIMATIONS_H
#define ANIMATIONS_H

#include "types/Manager.h"
#include <functional>

namespace grynca {

    // fw
    class AssetsManager;
    class SpriteAnimation;


    class SpriteAnimations : public Manager<SpriteAnimation>
    {
    public:
        SpriteAnimations(AssetsManager& am);

        AssetsManager& getManager();
    private:
        AssetsManager* manager_;
    };
}

#include "SpriteAnimations.inl"
#endif //ANIMATIONS_H
