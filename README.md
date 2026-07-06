# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Chat website

TROEZ dùng widget chat riêng trên website. Khách truy cập có thể chat ngay, không cần đăng nhập Facebook hoặc Messenger.

- API của khách truy cập nằm dưới `/api/chat/*` và định danh hội thoại bằng `publicToken` khó đoán.
- API của quản trị nằm dưới `/api/admin/chat/*` và yêu cầu JWT có vai trò `Admin` hoặc `Owner`.
- Realtime dùng SSE: `/api/chat/conversations/:publicToken/stream` cho khách truy cập và `/api/admin/chat/stream` cho quản trị.
- Tệp đính kèm dùng hạ tầng lưu trữ hiện có của backend và được lưu trong `uploads/chat`.

Nếu chạy nhiều instance ở production, cần thay hoặc mở rộng broadcaster SSE trong bộ nhớ bằng pub/sub dùng chung, ví dụ Redis.
