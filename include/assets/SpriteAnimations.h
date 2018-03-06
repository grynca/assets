#ifndef ANIMATIONS_H
#define ANIMATIONS_H

#include "types/Manager.h"
#include <functional>

namespace grynca {

    // fw
    class AssetsManagerBase;
    class SpriteAnimation;


    class SpriteAnimations : public Manager<SpriteAnimation>
    {
    public:
        SpriteAnimations(AssetsManagerBase& am);

        AssetsManagerBase& getManager();
    private:
        AssetsManagerBase* manager_;
    };
}

#include "SpriteAnimations.inl"
#endif //ANIMATIONS_H
