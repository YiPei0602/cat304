import { useEffect, useState, useRef } from 'react';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  getDoc, 
  addDoc, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import Sidebar from './Sidebar';
import { IoSearchOutline } from 'react-icons/io5';

function AdminChat() {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  const [userNames, setUserNames] = useState({}); // Store user names
  const [searchQuery, setSearchQuery] = useState('');
  const [chatListWidth, setChatListWidth] = useState(400); // Initial width
  const resizeRef = useRef(null);
  const isResizingRef = useRef(false);

  // Update filtered messages when messages or search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMessages(messages);
      return;
    }

    const filtered = messages.filter((chat) => {
      const userName = chat.userName?.toLowerCase() || '';
      const searchTerm = searchQuery.toLowerCase();
      
      // Search in all messages of the chat
      const messagesMatch = chat.messages?.some(message => 
        message.text?.toLowerCase().includes(searchTerm)
      );
      
      // Search in username
      const userMatch = userName.includes(searchTerm);
      
      return userMatch || messagesMatch;
    });

    setFilteredMessages(filtered);
  }, [messages, searchQuery]);

  // Search handler
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    setFilteredMessages(messages);
  }, [messages]);

  useEffect(() => {
    const fetchUserAndMessages = async () => {
      try {
        console.log('Starting to fetch messages and user data...');
        
        const chatIds = [
          '4BxR5TY0jAUg2WXTiDpqqHXhOi92',
          'fIZNz8yMV9gNgK5iVgHCyhUNJZx2'
        ];

        // First, fetch user information for each chat
        const names = {};
        for (const userId of chatIds) {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            names[userId] = userData.name || userData.fullName || 'Anonymous Donor';
          }
        }
        setUserNames(names);

        // Set up real-time listeners for each chat
        chatIds.forEach(chatId => {
          const messagesRef = collection(db, 'chats', chatId, 'messages');
          const q = query(messagesRef, orderBy('timestamp', 'asc'));
          
          onSnapshot(q, (snapshot) => {
            const chatMessages = snapshot.docs.map(doc => ({
              id: doc.id,
              userId: chatId,
              ...doc.data()
            }));

            setMessages(prevMessages => {
              // Remove old version of this chat
              const otherChats = prevMessages.filter(chat => chat.userId !== chatId);
              
              // Create updated chat
              const updatedChat = {
                userId: chatId,
                userName: names[chatId],
                messages: chatMessages,
                lastMessage: chatMessages[chatMessages.length - 1],
                lastTimestamp: chatMessages[chatMessages.length - 1]?.timestamp
              };

              // Sort chats by last message timestamp
              const newMessages = [...otherChats, updatedChat].sort((a, b) => {
                const timeA = a.lastTimestamp?.toMillis() || 0;
                const timeB = b.lastTimestamp?.toMillis() || 0;
                return timeB - timeA; // Descending order (newest first)
              });

              // Update selected chat if needed
              if (selectedChat?.userId === chatId) {
                setSelectedChat(updatedChat);
              }

              return newMessages;
            });
          });
        });

        console.log('Processed chats:', messages);
        setDebugInfo({
          processedChatIds: chatIds,
          totalChatsProcessed: messages.length,
          messagesLength: messages.reduce((acc, chat) => acc + chat.messages.length, 0),
          userNames: names,
          dbConnection: !!db,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Error fetching data:', error);
        setDebugInfo({
          error: error.message,
          stack: error.stack,
          dbConnection: !!db,
          timestamp: new Date().toISOString()
        });
      }
    };

    fetchUserAndMessages();

    // Sidebar collapse observer
    const checkSidebarState = () => {
      const sidebar = document.querySelector('.sidebar');
      setIsCollapsed(sidebar?.classList.contains('collapsed') || false);
    };

    checkSidebarState();
    const observer = new MutationObserver(checkSidebarState);
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      observer.observe(sidebar, { attributes: true });
    }

    return () => {
      observer.disconnect();
      // Cleanup will be handled automatically for onSnapshot
    };
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const messagesRef = collection(db, 'chats', selectedChat.userId, 'messages');
      
      // Add new message
      await addDoc(messagesRef, {
        text: newMessage,
        timestamp: serverTimestamp(),
        isUser: false,
        senderId: 'admin'
      });

      setNewMessage('');

      // Fetch updated messages for this chat
      const q = query(messagesRef, orderBy('timestamp', 'asc'));
      const messagesSnapshot = await getDocs(q);
      
      const updatedMessages = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        userId: selectedChat.userId,
        ...doc.data()
      }));

      // Update messages state and move this chat to top
      setMessages(prevMessages => {
        const otherChats = prevMessages.filter(chat => chat.userId !== selectedChat.userId);
        const updatedChat = {
          ...selectedChat,
          messages: updatedMessages,
          lastMessage: updatedMessages[updatedMessages.length - 1]
        };
        
        // Put the updated chat at the beginning of the array
        return [updatedChat, ...otherChats];
      });

      // Update selected chat
      setSelectedChat(prev => ({
        ...prev,
        messages: updatedMessages,
        lastMessage: updatedMessages[updatedMessages.length - 1]
      }));

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  // Add resize functionality
  useEffect(() => {
    const handleMouseDown = (e) => {
      isResizingRef.current = true;
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
      if (!isResizingRef.current) return;
      
      // Calculate new width (minimum 280px, maximum 600px)
      const newWidth = Math.max(280, Math.min(600, e.clientX - 250));
      setChatListWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    const resizer = resizeRef.current;
    resizer?.addEventListener('mousedown', handleMouseDown);

    return () => {
      resizer?.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Sidebar userRole="admin" />
      <div className={`flex-1 p-4 transition-all duration-300 ${
        isCollapsed ? 'ml-[80px]' : 'ml-[250px]'
      }`}>
        <div className="bg-white rounded-lg shadow flex flex-col h-[calc(100vh-2rem)]">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">Donor Support Messages</h2>
          </div>

          <div className="flex flex-1 min-h-0">
            {/* Chat list with resizable width */}
            <div style={{ width: chatListWidth }} className="relative flex flex-col border-r">
              <div className="p-3 border-b">
                <div className="flex items-center bg-gray-100 rounded-lg p-2">
                  <IoSearchOutline className="text-gray-500 mr-2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Search chats"
                    className="bg-transparent outline-none flex-1"
                  />
                </div>
              </div>

              <div className="overflow-y-auto flex-1">
                {filteredMessages.length === 0 ? (
                  <div className="p-4 text-gray-500 text-center">
                    {searchQuery ? 'No matching chats found' : 'No chats found'}
                  </div>
                ) : (
                  filteredMessages.map((chat) => (
                    <div
                      key={chat.userId}
                      onClick={() => setSelectedChat(chat)}
                      className={`p-3 border-b cursor-pointer hover:bg-gray-50 text-left ${
                        selectedChat?.userId === chat.userId ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="font-medium">
                        {chat.userName || `Donor ${chat.userId.slice(0, 8)}`}
                      </div>
                      <div className="text-sm text-gray-500 truncate text-left">
                        {chat.lastMessage?.text}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Resize handle */}
              <div
                ref={resizeRef}
                className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500 hover:opacity-50 z-10"
              />
            </div>

            {/* Main chat area */}
            <div className="flex-1 flex flex-col min-h-0">
              {selectedChat ? (
                <>
                  {/* Header */}
                  <div className="p-3 border-b">
                    <div className="font-medium">
                      {selectedChat.userName || `Donor ${selectedChat.userId.slice(0, 8)}`}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-0">
                    {selectedChat.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`mb-3 ${message.isUser ? 'text-right' : 'text-left'}`}
                      >
                        <div className="inline-flex flex-col">
                          <div
                            className={`p-3 rounded-lg ${
                              message.isUser ? 'bg-blue-500 text-white' : 'bg-white'
                            } shadow-sm`}
                          >
                            {message.text}
                          </div>
                          <span className="text-xs text-gray-500 mt-1">
                            {message.timestamp?.toDate().toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input area */}
                  <div className="bg-white border-t">
                    <div className="flex items-start px-4 py-2">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border rounded-lg outline-none resize-none min-h-[40px] max-h-[80px]"
                        rows="1"
                      />
                      <button 
                        onClick={handleSendMessage}
                        className="ml-3 px-6 h-10 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                        disabled={!newMessage.trim()}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Select a chat to start messaging
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminChat; 