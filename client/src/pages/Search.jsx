import { Button, Select, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";

export default function Search() {
  const [sidebarData, setSidebarData] = useState({
    searchTerm: "",
    sort: "desc",
    category: "uncategorized",
  });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm") || "";
    const sortFromUrl = urlParams.get("sort") || "desc";
    const categoryFromUrl = urlParams.get("category") || "uncategorized";

    setSidebarData({
      searchTerm: searchTermFromUrl,
      sort: sortFromUrl,
      category: categoryFromUrl,
    });

    const fetchLocalPosts = () => {
      setLoading(true);
      let storedPosts = JSON.parse(localStorage.getItem("posts")) || [];

      // filter by search term
      if (searchTermFromUrl) {
        storedPosts = storedPosts.filter((post) =>
          post.title.toLowerCase().includes(searchTermFromUrl.toLowerCase())
        );
      }

      // filter by category
      if (categoryFromUrl && categoryFromUrl !== "uncategorized") {
        storedPosts = storedPosts.filter(
          (post) =>
            post.category &&
            post.category.toLowerCase() === categoryFromUrl.toLowerCase()
        );
      }

      // sort
      storedPosts.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return sortFromUrl === "desc" ? dateB - dateA : dateA - dateB;
      });

      setPosts(storedPosts);
      setLoading(false);
    };

    fetchLocalPosts();
  }, [location.search]);

  const handleChange = (e) => {
    setSidebarData({ ...sidebarData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    urlParams.set("searchTerm", sidebarData.searchTerm);
    urlParams.set("sort", sidebarData.sort);
    urlParams.set("category", sidebarData.category);
    navigate(`/search?${urlParams.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="p-7 border-b md:border-r md:min-h-screen border-gray-500 w-full md:w-1/3">
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-3">
            <label className="font-semibold">Search Posts</label>
            <div className="flex gap-2">
              <TextInput
                placeholder="Search..."
                id="searchTerm"
                type="text"
                value={sidebarData.searchTerm}
                onChange={handleChange}
                className="w-full"
              />
              <Button type="submit" gradientDuoTone="purpleToPink" pill>
                Search
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex items-center gap-2 w-full">
              <label className="font-semibold whitespace-nowrap">Sort:</label>
              <Select
                id="sort"
                value={sidebarData.sort}
                onChange={handleChange}
                className="w-full"
              >
                <option value="desc">Newest</option>
                <option value="asc">Oldest</option>
              </Select>
            </div>
          </div>
        </form>
      </div>

      {/* Posts */}
      <div className="w-full md:w-2/3">
        <h1 className="text-3xl font-semibold sm:border-b border-gray-500 p-3 mt-5">
          Posts Results:
        </h1>
        <div className="p-7 flex flex-wrap gap-4">
          {loading && <p>Loading...</p>}
          {!loading && posts.length === 0 && <p>No posts found.</p>}
          {!loading &&
            posts.map((post, index) => <PostCard key={index} post={post} />)}
        </div>
      </div>
    </div>
  );
}
