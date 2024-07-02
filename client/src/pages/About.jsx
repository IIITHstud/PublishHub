export default function About() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-3 text-center">
        <div>
          <h1 className="text-3xl font font-semibold text-center my-7">
            About Our Platform
          </h1>
          <div className="text-md flex flex-col gap-6">
            <p>
              Welcome to our platform, where your voice matters! We've created a
              dynamic space for content media and independent writers to share
              news articles and creative insights. Our goal is to empower
              everyone to express themselves and stay informed.
            </p>

            <p>Here’s what you can do on our website:</p>
            <ul className="list-disc list-inside text-left">
              <li>
                <strong>Post Articles:</strong> Share your thoughts, news, and
                stories with our community. Whether you're an aspiring
                journalist, a seasoned writer, or someone with a unique
                perspective, your content is welcome here.
              </li>
              <li>
                <strong>Read and Explore:</strong> Dive into a diverse range of
                articles written by people from all walks of life. Discover new
                ideas, learn about current events, and get inspired by the
                voices of our community.
              </li>
              <li>
                <strong>Summarize:</strong> Find long articles overwhelming? Our
                platform allows you to read concise summaries, making it easier
                to get the gist of the content quickly.
              </li>
              <li>
                <strong>Translate:</strong> Language should never be a barrier
                to information. With our translation feature, you can read
                articles in your preferred language, making our platform truly
                global.
              </li>
              <li>
                <strong>Convert to Audio:</strong> Prefer listening over
                reading? Convert articles to audio and enjoy content on the go.
                Perfect for multitasking or for those who find listening more
                convenient.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
