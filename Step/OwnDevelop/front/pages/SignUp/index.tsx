import React, { useCallback, useState } from 'react';
import { Success, Form, Error, Label, Input, LinkContainer, Button, Header } from './styles';
import { Link, Navigate } from 'react-router-dom';
import useInput from '@hooks/useinput';
import axios from 'axios';
import useSWR from 'swr';
import fetcher from '@utils/fetcher';

const SignUp = () => {
  const { data } = useSWR('/api/users', fetcher, {
    dedupingInterval: 100000,
  });
  const [email, setEmail, onChangeEmail] = useInput('');
  const [nickname, setNickname, onChangeNickname] = useInput('');
  const [password, setPassword] = useInput('');
  const [passwordCheck, setPasswordCheck] = useInput('');
  const [mismatchError, setMismatchError] = useInput(false); //비밀번호 설정 오류 체크
  const [signUpError, setSignUpError] = useInput('');
  const [signUpSuccess, setSignUpSuccess] = useInput(false);

  const onChangePassword = useCallback(
    (e) => {
      setPassword(e.target.value);
      setMismatchError(e.target.value !== passwordCheck);
    },
    [passwordCheck, setMismatchError, setPassword],
  );

  const onChangePasswordCheck = useCallback(
    (e) => {
      setPasswordCheck(e.target.value);
      setMismatchError(e.target.value !== password);
    },
    [password, setMismatchError, setPasswordCheck],
  );

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!mismatchError && nickname) {
        setSignUpError('');
        setSignUpSuccess(true);
        axios
          .post('/api/users', {
            email,
            nickname,
            password,
          })
          .catch((error) => {
            setSignUpError(error.response.data);
          });
      }
    },
    [mismatchError, nickname, setSignUpError, setSignUpSuccess, email, password],
  );

  if (data === undefined) {
    return <div>loading...</div>;
  }

  if (data) {
    return <Navigate to="/workspace/sleact/channel/일반" />;
  }

  return (
    <div id="container">
      <Header>Sleact</Header>
      <Form onSubmit={onSubmit}>
        <Label id="email-label">
          <span>이메일 주소</span>
          <div>
            <Input type="email" id="email" name="email" value={email} onChange={onChangeEmail} />
          </div>
        </Label>
        <Label id="nickname-label">
          <span>닉네임</span>
          <div>
            <Input type="text" id="nickname" name="nickname" value={nickname} onChange={onChangeNickname} />
          </div>
        </Label>
        <Label id="password-label">
          <span>비밀번호</span>
          <div>
            <Input type="password" id="password" name="password" value={password} onChange={onChangePassword} />
          </div>
        </Label>
        <Label id="password-check-label">
          <span>비밀번호 확인</span>
          <div>
            <Input
              type="password"
              id="password-check"
              name="password-check"
              value={passwordCheck}
              onChange={onChangePasswordCheck}
            />
          </div>
          {mismatchError && <Error>비밀번호가 일치하지 않습니다.</Error>}
          {!nickname && <Error>닉네임을 입력해주세요.</Error>}
          {signUpError && <Error>{signUpError}</Error>}
          {signUpSuccess && <Success>회원가입되었습니다! 로그인해주세요.</Success>}
        </Label>
        <Button type="submit">회원가입</Button>
      </Form>
      <LinkContainer>
        이미 회원이신가요?&nbsp;
        <Link to="/login">로그인 하러가기</Link>
      </LinkContainer>
    </div>
  );
};

export default SignUp;
