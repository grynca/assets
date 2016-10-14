#include "Animation.h"
#include "Animations.h"
#include "AssetsManager.h"
#include "assets/ImagesPack.h"

namespace grynca {

    inline AnimationFrame::AnimationFrame(const std::string& image_path, float time)
     : image_path_(image_path), time_(time), frame_id_(InvalidId())
    {
    }

    inline const std::string& AnimationFrame::getImagePath()const {
        return image_path_;
    }

    inline float AnimationFrame::getTime()const {
        return time_;
    }

    inline const TextureRegion& AnimationFrame::getRegion()const {
        return region_;
    }

    inline uint32_t AnimationFrame::getFrameId()const {
        return frame_id_;
    }

    inline void AnimationFrame::setTime(float time) {
        time_ = time;
    }

    inline Animation& Animation::init(const fast_vector<AnimationFrame>& frames) {
        ASSERT_M(frames.size(), "Animation must contain at least 1 frame.");
        frames_ = frames;
        for (uint32_t i=0; i<frames_.size(); ++i) {
            frames_[i].frame_id_ = i;
        }

        AssetsManager& mgr = getManager().getManager();

        // find pack where is first frame
        ImagesPack* pack = NULL;
        bool found = false;
        for (uint32_t j=0; j<mgr.getImagesPacks().getItemsCount(); ++j) {
            pack = mgr.getImagesPacks().getItemAtPos(j);
            if (!pack)
                continue;
            ImagesPack::Regions::const_iterator it = pack->getRegions().find(frames_[0].getImagePath());
            if (it!=pack->getRegions().end()) {
                found = true;
                frames_[0].region_ = it->second;
            }
        }

        ASSERT_M(found, "First animation frame not found.");

        // set regions for rest of the frames (must be in same pack)
        for (uint32_t i=1; i<frames_.size(); ++i) {
            ImagesPack::Regions::const_iterator it = pack->getRegions().find(frames_[i].getImagePath());
            ASSERT_M(it!=pack->getRegions().end(), "Animation frame not found");
            frames_[i].region_ = it->second;
        }
        return *this;
    }

    inline uint32_t Animation::getFramesCount()const {
        return uint32_t(frames_.size());
    }
    inline AnimationFrame& Animation::getFrame(uint32_t frame_id) {
        return frames_[frame_id];
    }

}