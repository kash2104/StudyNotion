import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { markLectureAsComplete } from "../../../services/operations/courseDetailsAPI";
import { updateCompletedLectures } from "../../../slices/viewCourseSlice";
import "video-react/dist/video-react.css";
import { BigPlayButton, Player } from "video-react";
import { AiFillPlayCircle } from "react-icons/ai";
import IconBtn from "../../common/IconBtn";

const VideoDetails = () => {
  //data needed for all the below functions
  const { courseId, sectionId, subSectionId } = useParams();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const playerRef = useRef();

  const { token } = useSelector((state) => state.auth);
  const { courseSectionData, courseEntireData, completedLectures } =
    useSelector((state) => state.viewCourse);

  const [videoData, setVideoData] = useState([]);
  const [videoEnded, setVideoEnded] = useState(false);
  const [loading, setLoading] = useState(false);

  //if no data found then show the thumbnail of the course
  const [previewSource, setPreviewSource] = useState("");

  //showing in the first render
  useEffect(() => {
    const setVideoSpecificDetails = async () => {
      //check if data present
      if (!courseSectionData.length) {
        return;
      }

      if (!courseId && !sectionId && !subSectionId) {
        navigate("/dashboard/enrolled-courses");
      } else {
        //assuming all the three fields are present

        //fetching the section i.e. voh vala section aa gaya jo url me hain from the entire data
        const filteredData = courseSectionData.filter(
          (course) => course._id === sectionId
        );

        //fetching the subSection
        const filteredVideoData = filteredData?.[0]?.subSection.filter(
          (data) => data._id === subSectionId
        );
        // console.log("videoData: ", filteredVideoData[0]);

        setVideoData(filteredVideoData[0]);
        // console.log("after setting videoData: ", videoData);
        setPreviewSource(courseEntireData.thumbnail);

        setVideoEnded(false);
      }
    };
    setVideoSpecificDetails();
  }, [courseSectionData, courseEntireData, location.pathname]);

  //if video gets over, prev||next video button appears. If it is a first video, then no prev button and if last video then no next button
  const isFirstVideo = () => {
    //0th index vala section and uske andar 0th index vala subSection

    //finding the index
    const currentSectionIndex = courseSectionData.findIndex(
      (data) => data._id === sectionId
    );

    const currentSubSectionIndex = courseSectionData[
      currentSectionIndex
    ].subSection.findIndex((data) => data._id === subSectionId);

    if (currentSectionIndex === 0 && currentSubSectionIndex === 0) {
      return true;
    } else {
      return false;
    }
  };

  const isLastVideo = () => {
    //n-1 section ki n-1 subSection
    const currentSectionIndex = courseSectionData.findIndex(
      (data) => data._id === sectionId
    );

    const currentSubSectionIndex = courseSectionData[
      currentSectionIndex
    ].subSection.findIndex((data) => data._id === subSectionId);

    const noOfSubSections =
      courseSectionData[currentSectionIndex].subSection.length;

    if (
      currentSectionIndex === courseSectionData.length - 1 &&
      currentSubSectionIndex === noOfSubSections - 1
    ) {
      return true;
    } else {
      return false;
    }
  };

  //going to the next video
  const goToNextVideo = () => {
    //2 cases: same section nxt video & nxt section first video

    const currentSectionIndex = courseSectionData.findIndex(
      (data) => data._id === sectionId
    );

    const noOfSubSections =
      courseSectionData[currentSectionIndex].subSection.length;

    const currentSubSectionIndex = courseSectionData[
      currentSectionIndex
    ].subSection.findIndex((data) => data._id === subSectionId);

    if (currentSubSectionIndex !== noOfSubSections - 1) {
      //same section nxt subSection
      const nextSubSectionId =
        courseSectionData[currentSectionIndex].subSection[
          currentSubSectionIndex + 1
        ]._id;

      //gone to next video
      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`
      );
    } else {
      //next section ki first video
      const nextSectionId = courseSectionData[currentSectionIndex + 1]._id;
      const nextSubSectionId =
        courseSectionData[currentSectionIndex + 1].subSection[0]._id;

      //gone to next video
      navigate(
        `/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`
      );
    }
  };

  //going to the previous video
  const goToPrevVideo = () => {
    //2 cases: same section prev video & prev section last video

    const currentSectionIndex = courseSectionData.findIndex(
      (data) => data._id === sectionId
    );

    const currentSubSectionIndex = courseSectionData[
      currentSectionIndex
    ].subSection.findIndex((data) => data._id === subSectionId);

    const noOfSubSections =
      courseSectionData[currentSectionIndex].subSection.length;

    if (currentSubSectionIndex !== 0) {
      //same section prev video
      const prevSubSectionId =
        courseSectionData[currentSectionIndex].subSection[
          currentSubSectionIndex - 1
        ]._id;

      //go to prev video
      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`
      );
    } else {
      //prev section last video
      const prevSectionId = courseSectionData[currentSectionIndex - 1]._id;

      const prevSubSectionLength =
        courseSectionData[currentSectionIndex - 1].subSection.length;

      const prevSubSectionId =
        courseSectionData[currentSectionIndex - 1].subSection[
          prevSubSectionLength - 1
        ]._id;

      //go to the prev video
      navigate(
        `/view-course/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`
      );
    }
  };

  //marking the lecture as complete
  const handleLectureCompletion = async () => {
    setLoading(true);

    //controller for courseProgress remaining
    const result = await markLectureAsComplete(
      { courseId: courseId, subSectionId: subSectionId },
      token
    );

    //updating the state
    if (result) {
      dispatch(updateCompletedLectures(subSectionId));
    }

    setLoading(false);
  };

  //ReWatch ke liye video component ka seek = 0 kar denge i.e. we are accessing the DOM ELEMENT so need to use useRef hook.

  //videoEnd ka flag hona chahiye i.e. if the video ends then we have to show the next, prev, rewatch button.

  return (
    // 6things: video, rewatchBtn, play/pauseBtn, markAsComplete, nextvideo, prevVideo
    <div className="flex flex-col gap-5 text-white">
      {!videoData ? (
        //if no data found
        <img
          src={previewSource}
          alt="Preview"
          className="h-full w-full rounded-md object-cover"
        />
      ) : (
        <Player
          ref={playerRef}
          aspectRatio="16:9"
          playsInline
          onEnded={() => setVideoEnded(true)}
          src={videoData?.videoUrl}
        >
          <BigPlayButton position="center" />

          {videoEnded && (
            <div
              style={{
                backgroundImage:
                  "linear-gradient(to top, rgb(0, 0, 0), rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1)",
              }}
              className="full absolute inset-0 z-[100] grid h-full place-content-center font-inter"
            >
              {/* only for those jo pehle se completed nhi hain */}
              {!completedLectures.includes(subSectionId) && (
                <IconBtn
                  disabled={loading}
                  onclick={() => handleLectureCompletion()}
                  text={!loading ? "Mark As Completed" : "Loading..."}
                  customClasses="text-xl max-w-max px-4 mx-auto"
                />
              )}

              {/* rewatch btn  */}
              <IconBtn
                disabled={loading}
                onclick={() => {
                  //seek = 0 karna hain i.e. video ko vapas se start karna hain matlab current time set kardo = 0
                  if (playerRef?.current) {
                    playerRef.current?.seek(0);
                    playerRef.current.play();
                    setVideoEnded(false);
                  }
                }}
                text="Rewatch"
                customClasses="text-xl max-w-max px-4 mx-auto mt-2"
              />

              {/* previous and next button */}
              <div className="mt-10 flex min-w-[250px] justify-center gap-x-4 text-xl">
                {!isFirstVideo() && (
                  <button
                    disabled={loading}
                    onClick={goToPrevVideo}
                    className="blackButton"
                  >
                    Prev
                  </button>
                )}

                {!isLastVideo() && (
                  <button
                    disabled={loading}
                    onClick={goToNextVideo}
                    className="blackButton"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          )}
        </Player>
      )}

      <h1 className="mt-4 text-3xl font-semibold">{videoData?.title}</h1>

      <p className="pt-2 pb-6">{videoData?.description}</p>
    </div>
  );
};

export default VideoDetails;
