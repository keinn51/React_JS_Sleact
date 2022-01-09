import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import loadable from '@loadable/component';

// 코드스플릿팅을 통해, APP 컴포넌트에서 여러번 import를 하지 않게 해준다.
const Login = loadable(() => import('@pages/Login'));
const SignUp = loadable(() => import('@pages/SignUp'));
const Workspace = loadable(() => import('@layouts/Workspace'));

// * 을 잘 사용해줘야 한다. react v6 에서는 와일드카드를 잘 사용하는 것이 중요
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/workspace/:workspace/*" element={<Workspace />} />
      </Routes>
    </Router>
  );
};

export default App;
