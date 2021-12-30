import React, { CSSProperties, FC, useCallback } from "react";
import { CloseModalButton, CreateMenu } from "@components/Menu/styles";

interface props {
  show: boolean;
  onCloseModal: (e: any) => void;
  style:CSSProperties;
  closeButton?: boolean;
}

const Menu: FC<props> = ({children, style, show, onCloseModal, closeButton}) => {
  const stopPropagation = useCallback((e) => {
    e.stopPropagation();
  },[]);

  if (!show) return null;

  // CreateMenu 는 페이지 전체 크기를 대상으로 하는 div
  // 따라서 Menu에 style (top, left...) 을 보내주면서, 메뉴들을 띄을 수 있다.
  // 페이지 전체를 대상으로 포스트잇을 붙이는 것 같은 느낌.
  return(
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
}

export default Menu;