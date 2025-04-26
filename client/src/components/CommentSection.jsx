import { Modal, Table, Button, Textarea, Alert } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { FaThumbsUp, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function DashComments() {
  const { currentUser } = useSelector((state) => state.user);
  const [comments, setComments] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [commentIdToDelete, setCommentIdToDelete] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newCommentError, setNewCommentError] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/comment/getcomments`);
        const data = await res.json();
        if (res.ok) {
          setComments(data.comments);
          if (data.comments.length < 9) setShowMore(false);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    if (currentUser.isAdmin) fetchComments();
  }, [currentUser._id]);

  const handleShowMore = async () => {
    const startIndex = comments.length;
    try {
      const res = await fetch(`/api/comment/getcomments?startIndex=${startIndex}`);
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [...prev, ...data.comments]);
        if (data.comments.length < 9) setShowMore(false);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDeleteComment = async () => {
    setShowModal(false);
    try {
      const res = await fetch(`/api/comment/deleteComment/${commentIdToDelete}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c._id !== commentIdToDelete));
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleCreateComment = async () => {
    if (!currentUser) return navigate('/sign-in');
    if (newComment.length === 0) return setNewCommentError('Comment cannot be empty');

    try {
      const res = await fetch('/api/comment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          postId: 'admin-panel-post',
          userId: currentUser._id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments([data, ...comments]);
        setNewComment('');
        setNewCommentError('');
      } else {
        setNewCommentError(data.message || 'Failed to add comment');
      }
    } catch (error) {
      setNewCommentError(error.message);
    }
  };

  const handleLike = async (commentId) => {
    try {
      const res = await fetch(`/api/comment/likeComment/${commentId}`, {
        method: 'PUT',
      });
      const data = await res.json();
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === commentId
              ? {
                  ...c,
                  likes: data.likes,
                  numberOfLikes: data.numberOfLikes,
                }
              : c
          )
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleEdit = (comment) => {
    setEditingCommentId(comment._id);
    setEditingContent(comment.content);
  };

  const handleSaveEdit = async (commentId) => {
    try {
      const res = await fetch(`/api/comment/editComment/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editingContent }),
      });
      const updated = await res.json();
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => (c._id === commentId ? { ...c, content: updated.content } : c))
        );
        setEditingCommentId(null);
        setEditingContent('');
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="p-3 overflow-x-auto md:mx-auto max-w-full">
      {currentUser && (
        <div className="mb-5 border border-teal-500 p-4 rounded-md">
          <h2 className="text-md font-semibold mb-2">Add New Comment</h2>
          <Textarea
            placeholder="Type your comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            maxLength={200}
          />
          <div className="flex justify-between mt-2 items-center">
            <p className="text-xs text-gray-500">{200 - newComment.length} characters left</p>
            <Button gradientDuoTone="purpleToBlue" onClick={handleCreateComment}>
              Post Comment
            </Button>
          </div>
          {newCommentError && <Alert color="failure" className="mt-2">{newCommentError}</Alert>}
        </div>
      )}

      {currentUser.isAdmin && comments.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date updated</Table.HeadCell>
              <Table.HeadCell>Comment content</Table.HeadCell>
              <Table.HeadCell>Likes</Table.HeadCell>
              <Table.HeadCell>Post ID</Table.HeadCell>
              <Table.HeadCell>User ID</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            {comments.map((comment) => (
              <Table.Body className="divide-y" key={comment._id}>
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>{new Date(comment.updatedAt).toLocaleDateString()}</Table.Cell>
                  <Table.Cell>
                    {editingCommentId === comment._id ? (
                      <>
                        <Textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          rows={2}
                        />
                        <Button size="xs" onClick={() => handleSaveEdit(comment._id)} className="mt-1">
                          Save
                        </Button>
                      </>
                    ) : (
                      comment.content
                    )}
                  </Table.Cell>
                  <Table.Cell className="flex gap-2 items-center">
                    <span>{comment.numberOfLikes}</span>
                    <button
                      className="text-blue-500 hover:scale-110"
                      onClick={() => handleLike(comment._id)}
                    >
                      <FaThumbsUp />
                    </button>
                  </Table.Cell>
                  <Table.Cell>{comment.postId}</Table.Cell>
                  <Table.Cell>{comment.userId}</Table.Cell>
                  <Table.Cell className="flex gap-2">
                    <button
                      className="text-green-600 hover:underline"
                      onClick={() => handleEdit(comment)}
                    >
                      <FaEdit />
                    </button>
                    <span
                      onClick={() => {
                        setShowModal(true);
                        setCommentIdToDelete(comment._id);
                      }}
                      className="text-red-500 hover:underline cursor-pointer"
                    >
                      Delete
                    </span>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table>
          {showMore && (
            <button
              onClick={handleShowMore}
              className="w-full text-teal-500 self-center text-sm py-7"
            >
              Show more
            </button>
          )}
        </>
      ) : (
        <p className="text-sm text-center text-gray-500 mt-10">You have no comments yet!</p>
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)} popup size="md">
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this comment?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeleteComment}>
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
