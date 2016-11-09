#ifndef ANIMATION_H
#define ANIMATION_H

#include "types/Manager.h"
#include "assets/TexturePacker.h"

namespace grynca {

    // fw
    class Animations;

    class AnimationFrame {
    public:
        AnimationFrame(const std::string& image_path, f32 time);

        const std::string& getImagePath()const;
        f32 getTime()const;
        const TextureRegion& getRegion()const;
        u32 getFrameId()const;

        void setTime(f32 time);
    private:
        friend class Animation;

        std::string image_path_;
        TextureRegion region_;
        f32 time_;
        u32 frame_id_;
    };


    class Animation : public ManagedItem<Animations> {
    public:
        Animation& init(const fast_vector<AnimationFrame>& frames);


        u32 getFramesCount()const;
        AnimationFrame& getFrame(u32 frame_id);
    private:
        fast_vector<AnimationFrame> frames_;
    };

}


#include "Animation.inl"
#endif //ANIMATION_H
