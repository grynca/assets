#ifndef ANIMATIONS_H
#define ANIMATIONS_H

#include "types/Manager.h"

namespace grynca {

    // fw
    class AssetsManager;
    class Animation;

    class Animations : public Manager<Animation>
    {
    public:
        Animations(AssetsManager& am) : manager_(&am) {}

        AssetsManager& getManager() { return *manager_; }
    private:
        AssetsManager* manager_;
    };
}
#endif //ANIMATIONS_H
