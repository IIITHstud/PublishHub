import { Button, Spinner, Card } from "flowbite-react";
import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import CallToAction from "../components/CallToAction";
import CommentSection from "../components/CommentSection";
import PostCard from "../components/PostCard";
import axios from "axios";

const API_KEY = "AIzaSyCmgugrC69ejVxSUPm5Dpwy_XtjbNmBjbw"; // Replace with your actual API key
const API_URL = "https://translation.googleapis.com/language/translate/v2";

const languageOptions = [
  { code: "hi", name: "Hindi" },
  { code: "bn", name: "Bengali" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "gu", name: "Gujarati" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh-CN", name: "Chinese (Simplified)" },
  // Add more languages as needed
];


export default function PostPage() {
  const { postSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState(null);
  const [summary, setSummary] = useState(null); // State to hold the summary
  const [summaryLoading, setSummaryLoading] = useState(false); // Loading state for summary

  // Translation state
  const [translatedText, setTranslatedText] = useState("");
  const [translateError, setTranslateError] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("hi");

  // Audio state
  const [loadingaudio, setloadingaudio] = useState(false);
  const [audioSrc, setAudioSrc] = useState(null);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);
  const audioRef = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setloadingaudio(true);
    setAudioSrc(null);
    setAudioCurrentTime(0);
    setAudioDuration(0);
    const halfContent = post.content.substring(0, 200);

   const url =
     "https://api-inference.huggingface.co/models/facebook/fastspeech2-en-ljspeech";
   const options = {
     method: "POST",
     headers: {
       Authorization: "Bearer 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",
       "Content-Type": "application/json",
     },
     body: JSON.stringify({ inputs: halfContent }),
   };

   try {
     const response = await fetch(url, options);

     if (!response.ok) {
       throw new Error(`HTTP error! status: ${response.status}`);
     }

     const arrayBuffer = await response.arrayBuffer();
     const audioBlob = new Blob([arrayBuffer], { type: "audio/flac" });
     const audioUrl = URL.createObjectURL(audioBlob);
     setAudioSrc(audioUrl);

     // Set audio duration
     const audioElement = new Audio(audioUrl);
     audioElement.addEventListener("loadedmetadata", () => {
       setAudioDuration(audioElement.duration);
     });
   } catch (error) {
     console.error("Error:", error);
   } finally {
     setloadingaudio(false);
   }
 };

 const handlePlaybackSpeedChange = (speed) => {
   setPlaybackSpeed(speed);
   setShowSpeedOptions(false); // Hide speed options after selection
   if (audioRef.current) {
     audioRef.current.playbackRate = speed;
   }
 };

 const handleAudioTimeUpdate = () => {
   if (audioRef.current) {
     setAudioCurrentTime(audioRef.current.currentTime);
   }
 };

  useEffect(() => {
    const fetchPost = async () => {

      try {
        setLoading(true);
        const res = await fetch(`/api/post/getposts?slug=${postSlug}`);
        const data = await res.json();
        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        if (res.ok) {
          setPost(data.posts[0]);
          setLoading(false);
          setError(false);

          setSummary(null);
          setTranslatedText("");
          setAudioSrc(null);
        }
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchPost();
  }, [postSlug]);

  useEffect(() => {
    try {
      const fetchRecentPosts = async () => {
        const res = await fetch(`/api/post/getposts?limit=3`);
        const data = await res.json();
        if (res.ok) {
          setRecentPosts(data.posts);
        }
      };
      fetchRecentPosts();
    } catch (error) {
      console.log(error.message);
    }
  }, []);

  const handleSummarize = async () => {
    if (!post || !post.content) {
      return; // No post content to summarize
    }

    setSummaryLoading(true);

    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer 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",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: post.content,
            parameters: { min_length: 100, max_length: 120 },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (!result || !result[0] || !result[0].summary_text) {
        throw new Error("Invalid response from summarization API");
      }

      setSummary(result[0].summary_text);
    } catch (error) {
      console.error("Error during summarization:", error);
      setSummary("Failed to summarize post");
    } finally {
      setSummaryLoading(false);
    }
  };

  const translateText = async (text, targetLanguage) => {
    try {
      const response = await axios.post(`${API_URL}?key=${API_KEY}`, {
        q: text,
        target: targetLanguage,
      });
      return response.data.data.translations[0].translatedText;
    } catch (error) {
      console.error("Error translating text:", error);
      throw error;
    }
  };

  const handleTranslate = async () => {
    if (post && post.content) {
      try {
        const translation = await translateText(post.content, targetLanguage);
        let cleanText = translation.replace(/<\/?p>/g, "");
        setTranslatedText(cleanText);
        setTranslateError("");
      } catch (error) {
        console.error("Error translating:", error);
        setTranslateError("Error translating text. Please try again.");
      }
    } else {
      setTranslateError("No content to translate.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );

  return (
    <main className="p-3 flex flex-col max-w-6xl mx-auto min-h-screen">
      <h1 className="text-3xl mt-10 p-3 text-center font-serif max-w-2xl mx-auto lg:text-4xl">
        {post && post.title}
      </h1>
      <Link
        to={`/search?category=${post && post.category}`}
        className="self-center mt-5"
      >
        <Button color="gray" pill size="xs">
          {post && post.category}
        </Button>
      </Link>
      <div className="mt-10 flex justify-center items-center">
        <Card className="max-w-2xl w-full shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 rounded-t-lg">
            <img
              src={post && post.image}
              alt={post && post.title}
              className="max-h-[600px] w-full object-cover rounded-lg"
            />
          </div>
        </Card>
      </div>
      <div className="flex justify-between p-3 border-b border-slate-500 mx-auto w-full max-w-2xl text-xs">
        <span>{post && new Date(post.createdAt).toLocaleDateString()}</span>
        <span className="italic">
          {post && (post.content.length / 1000).toFixed(0)} mins read
        </span>
      </div>
      <div
        className="p-3 max-w-2xl mx-auto w-full post-content"
        dangerouslySetInnerHTML={{ __html: post && post.content }}
      ></div>
      <div className="max-w-xl mx-auto w-full mt-5 flex justify-center">
        <Button
          onClick={handleSummarize}
          color="blue"
          gradientDuoTone="purpleToBlue"
          pill
          size="lg"
          disabled={summaryLoading}
        >
          {summaryLoading ? (
            <>
              <Spinner size="sm" className="mr-2" /> Summarizing...Wait a min.
            </>
          ) : (
            "Summarize Using AI"
          )}
        </Button>
        <Button
          onClick={handleSubmit}
          color="pink"
          gradientDuoTone="purpleToPink"
          pill
          size="lg"
          className="ml-4" // This will add some margin to the left to separate the buttons
        >
          Audio
        </Button>
      </div>
      {summary && (
        <div className="max-w-2xl mx-auto w-full my-5 mt-5 ">
          <h2 className="text-xl font-semibold mb-2 ">Summary</h2>
          <p>{summary}</p>
        </div>
      )}
      {/* Audio section */}
      {/* Audio section */}
      <div className="max-w-xl mx-auto w-full mt-10">
        {loadingaudio && (
          <div className="flex justify-center items-center">
            <p className="text-center">Please wait a moment...</p>
            {/* Spinner component */}
            <Spinner size="xl" />
          </div>
        )}
        {audioSrc && (
          <div className="audio-controls-container">
            {/* Audio player */}
            <audio
              ref={audioRef}
              src={audioSrc}
              controls
              onTimeUpdate={handleAudioTimeUpdate}
              onLoadedMetadata={() =>
                setAudioDuration(audioRef.current.duration)
              }
              playbackRate={playbackSpeed}
              className="audio-player"
            />

            {/* Speed options */}
            <div
              className="speed-options"
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "120px",
              }}
            >
              <button
                className={`speed-button ${playbackSpeed === 0.5 ? "active" : ""}`}
                onClick={() => handlePlaybackSpeedChange(0.5)}
                style={{
                  color: playbackSpeed === 0.5 ? "#ffff00" : "",
                }}
              >
                0.5x
              </button>
              <button
                className={`speed-button ${playbackSpeed === 1 ? "active" : ""}`}
                onClick={() => handlePlaybackSpeedChange(1)}
                style={{
                  color: playbackSpeed === 1 ? "#ffff00" : "",
                }}
              >
                1x
              </button>
              <button
                className={`speed-button ${playbackSpeed === 1.5 ? "active" : ""}`}
                onClick={() => handlePlaybackSpeedChange(1.5)}
                style={{
                  color: playbackSpeed === 1.5 ? "#ffff00" : "",
                }}
              >
                1.5x
              </button>
              <button
                className={`speed-button ${playbackSpeed === 2 ? "active" : ""}`}
                onClick={() => handlePlaybackSpeedChange(2)}
                style={{
                  color: playbackSpeed === 2 ? "#ffff00" : "",
                }}
              >
                2x
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Translation section */}
      <div className="max-w-xl mx-auto w-full mt-10">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Translate Article
        </h2>
        <div className="flex flex-col items-center mb-6">
          <select
            className="w-full p-3 mb-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-black"
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
          >
            {languageOptions.map((lang) => (
              <option
                key={lang.code}
                value={lang.code}
                className="bg-white text-black"
              >
                {lang.name}
              </option>
            ))}
          </select>
          <Button
            onClick={handleTranslate}
            color="blue"
            size="lg"
            outline
            gradientDuoTone="purpleToBlue"
          >
            Translate
          </Button>
        </div>
        {translateError && (
          <p className="text-red-500 text-center mb-4">{translateError}</p>
        )}
        {translatedText && (
          <div className="max-w-2xl mx-auto w-full my-5 mt-5">
            <h2 className="text-xl font-semibold mb-2">Translated text</h2>
            <div className="translated-text-container">
              <h1 className="text-lg leading-relaxed">{translatedText}</h1>
            </div>
          </div>
        )}
      </div>
      <CommentSection postId={post._id} />
      <div className="flex flex-col justify-center items-center mb-5">
        <h1 className="text-xl mt-5">Recent articles</h1>
        <div className="flex flex-wrap gap-5 mt-5 justify-center">
          {recentPosts &&
            recentPosts.map((post) => <PostCard key={post._id} post={post} />)}
        </div>
      </div>
    </main>
  );
}

