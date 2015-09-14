#ifndef IMAGESPACKS_H
#define IMAGESPACKS_H

#include "types/Manager.h"

namespace grynca {

    // fw
    class ImagesPack;
    class AssetsManager;

    class ImagesPacks : public Manager<ImagesPack> {
    public:
        ImagesPacks(AssetsManager& am) : manager_(&am) {}

        AssetsManager& getManager() { return *manager_; }

    private:
        AssetsManager* manager_;
    };

}

#endif //IMAGESPACKS_H
