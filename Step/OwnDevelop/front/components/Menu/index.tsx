import React, { CSSProperties, FC, useCallback } from 'react';
import { CloseModalButton, CreateMenu } from '@components/Menu/styles';

interface props {
  show: boolean;
  onCloseModal: (e: any) => void;
  style: CSSProperties;
  closeButton?: boolean;
}

const Menu: FC<props> = ({ children, style, show, onCloseModal, closeButton }) => {
  const stopPropagation = useCallback((e) => {
    e.stopPropagation();
  }, []);

  if (!show) return null;

  // CreateMenu 는 페이지 전체 크기를 대상으로 하는 div
  // CreateMenu-div 가 실질적으로 나오는 창이다.
  // 따라서 Menu에 style (top, left...) 을 보내주면서, 메뉴들을 띄을 수 있다.
  // 페이지 전체를 대상으로 포스트잇을 붙이는 것 같은 느낌.
  // button 역시 포지션에 맞춰서 div 안에 붙여져 있음
  // stopPropagation ► 상위 DOM으로 이벤트가 전파되는 것을 막는다.
  return (
    <CreateMenu onClick={onCloseModal}>
      <div onClick={stopPropagation} style={style}>
        {closeButton && <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>}
        {children}
      </div>
    </CreateMenu>
  );
};

Menu.defaultProps = {
  closeButton: true,
};

export default Menu;
