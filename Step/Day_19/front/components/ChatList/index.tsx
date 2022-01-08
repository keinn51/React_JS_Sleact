import React, { RefObject, useCallback, VFC } from 'react';
import { ChatZone, Section, StickyHeader } from '@components/ChatList/styles';
import { IDM } from '@typings/db';
import Chat from '@components/Chat';
import Scrollbars from 'react-custom-scrollbars';

interface Props {
  chatSections?: { [key: string]: IDM[] };
  scrollbarRef: RefObject<Scrollbars>;
  setSize: (f: (size: number) => number) => Promise<IDM[][] | undefined>;
  isReachingEnd: boolean;
}

const ChatList: VFC<Props> = ({ chatSections, scrollbarRef, setSize, isReachingEnd }) => {
  const onScroll = useCallback(
    (values) => {
      if (values.scrollTop === 0 && !isReachingEnd) {
        console.log(`TOP scroll!`);
        setSize((prevSize) => prevSize + 1).then(() => {
          if (scrollbarRef?.current) {
            scrollbarRef?.current?.scrollTop(scrollbarRef.current.getScrollHeight() - values.scrollHeight);
          }
        });
      }
    },
    [isReachingEnd, scrollbarRef, setSize],
  );

  return (
    <ChatZone>
      <Scrollbars autoHide ref={scrollbarRef} onScrollFrame={onScroll}>
        {chatSections
          ? Object.entries(chatSections).map(([date, chats]) => {
              return (
                <Section className={`section-${date}`} key={date}>
                  <StickyHeader>
                    <button>{date}</button>
                  </StickyHeader>
                  {chats.map((chat) => (
                    <Chat key={chat.id} data={chat} />
                  ))}
                </Section>
              );
            })
          : null}
      </Scrollbars>
    </ChatZone>
  );
};

export default ChatList;
