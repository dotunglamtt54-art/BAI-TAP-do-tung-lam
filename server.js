// Đây là mã nguồn Server Node.js sử dụng Express.
// Để chạy được code này, bạn cần cài đặt Node.js và thư viện Express trên máy tính của mình.

const express = require('express');
const app = express();
const PORT = 3000;

// Sử dụng CORS (Cross-Origin Resource Sharing) để cho phép client (index.html)
// chạy từ một nguồn khác (ví dụ: trình duyệt) có thể gọi API.
const cors = require('cors');

// Cấu hình Middleware
app.use(express.json()); // Để phân tích body JSON từ yêu cầu POST/PUT
app.use(cors()); // Cho phép mọi nguồn (hoặc bạn có thể chỉ định nguồn cụ thể)

// Dữ liệu giả lập (thay thế cho Database)
let mockTodos = [
    { id: '1', name: 'Hoàn thành báo cáo Node.js', completed: false, userId: 'simulated_user_id', createdAt: new Date() },
    { id: '2', name: 'Tìm hiểu về Fetch API', completed: true, userId: 'simulated_user_id', createdAt: new Date(Date.now() - 3600000) },
    { id: '3', name: 'Kiểm tra lỗi Server', completed: false, userId: 'simulated_user_id', createdAt: new Date(Date.now() - 7200000) },
    { id: '4', name: 'Viết tài liệu API', completed: true, userId: 'simulated_user_id', createdAt: new Date(Date.now() - 10800000) }
];

// --- API ENDPOINT ---

// GET /api/todos: Lấy tất cả công việc (Hỗ trợ tham số truy vấn 'search' và 'status')
app.get('/api/todos', async (req, res) => {
    const searchTerm = req.query.search ? req.query.search.toLowerCase() : null;
    const statusFilter = req.query.status ? req.query.status.toLowerCase() : null; // Thêm tham số status
    
    let filteredTodos = mockTodos;

    // 1. Lọc theo Trạng thái (status)
    if (statusFilter === 'completed') {
        filteredTodos = filteredTodos.filter(todo => todo.completed === true);
    } else if (statusFilter === 'active') { // 'active' thường được dùng cho công việc chưa xong
        filteredTodos = filteredTodos.filter(todo => todo.completed === false);
    }

    // 2. Lọc theo Tìm kiếm (search)
    if (searchTerm) {
        filteredTodos = filteredTodos.filter(todo => 
            todo.name.toLowerCase().includes(searchTerm)
        );
    }
    
    console.log(`[SERVER] Nhận yêu cầu. Search: "${searchTerm || 'none'}". Status: "${statusFilter || 'none'}". Trả về ${filteredTodos.length} công việc.`);
    
    res.status(200).json(filteredTodos);
});

// POST /api/todos: Thêm công việc mới
app.post('/api/todos', async (req, res) => {
    const { name, userId } = req.body;
    if (!name || !userId) {
        return res.status(400).json({ error: 'Thiếu tên công việc hoặc ID người dùng.' });
    }
    
    const newTodo = { 
        id: Math.random().toString(36).substring(2, 9), // ID giả lập
        name, 
        completed: false, 
        userId,
        createdAt: new Date()
    };
    
    // Thêm vào dữ liệu giả lập
    mockTodos.push(newTodo);
    console.log(`[SERVER] Đã thêm công việc: ${name}`);

    res.status(201).json({ 
        message: 'Công việc đã được tạo thành công!', 
        todo: newTodo 
    });
});

// PUT /api/todos/:id: Cập nhật trạng thái công việc
app.put('/api/todos/:id', async (req, res) => {
    const taskId = req.params.id;
    const { completed } = req.body;
    
    if (typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'Thiếu hoặc sai trạng thái completed.' });
    }

    const taskIndex = mockTodos.findIndex(t => t.id === taskId);
    
    if (taskIndex !== -1) {
        mockTodos[taskIndex].completed = completed;
        console.log(`[SERVER] Đã cập nhật trạng thái công việc ID ${taskId} thành ${completed}`);
        res.status(200).json({ 
            message: `Cập nhật công việc ${taskId} thành công.`, 
            updatedFields: { completed } 
        });
    } else {
        res.status(404).json({ error: 'Không tìm thấy công việc.' });
    }
});

// DELETE /api/todos/:id: Xóa công việc
app.delete('/api/todos/:id', async (req, res) => {
    const taskId = req.params.id;
    const initialLength = mockTodos.length;
    
    // Lọc ra task cần xóa
    mockTodos = mockTodos.filter(t => t.id !== taskId);

    if (mockTodos.length < initialLength) {
        console.log(`[SERVER] Đã xóa công việc ID: ${taskId}`);
        res.status(204).send(); // 204 No Content
    } else {
        res.status(404).json({ error: 'Không tìm thấy công việc để xóa.' });
    }
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server Node.js đang chạy tại http://localhost:${PORT}`);
    console.log(`Client (index.html) sẽ kết nối tới cổng này.`);
});
