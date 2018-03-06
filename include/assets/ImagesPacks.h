#ifndef IMAGESPACKS_H
#define IMAGESPACKS_H

#include "types/Manager.h"

namespace grynca {

    // fw
    class ImagesPack;
    class AssetsManagerBase;

    class ImagesPacks : public Manager<ImagesPack> {
    public:
        ImagesPacks(AssetsManagerBase& am) : manager_(&am) {}

        AssetsManagerBase& getManager() { return *manager_; }

    private:
        AssetsManagerBase* manager_;
    };

}

#endif //IMAGESPACKS_H
