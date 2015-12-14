#ifndef ANIMATION_H
#define ANIMATION_H

#include "types/Manager.h"
#include "assets/TexturePacker.h"

namespace grynca {

    // fw
    class Animations;

    class AnimationFrame {
    public:
        AnimationFrame(const std::string& image_path, float time);

        const std::string& getImagePath()const;
        float getTime()const;
        const TextureRegion& getRegion()const;
        uint32_t getFrameId()const;

        void setTime(float time);
    private:
        friend class Animation;

        std::string image_path_;
        TextureRegion region_;
        float time_;
        uint32_t frame_id_;
    };


    class Animation : public ManagedItem<Animations> {
    public:
        Animation& init(const fast_vector<AnimationFrame>& frames);


        uint32_t getFramesCount()const;
        AnimationFrame& getFrame(uint32_t frame_id);
    private:
        fast_vector<AnimationFrame> frames_;
    };

}


#include "Animation.inl"
#endif //ANIMATION_H
