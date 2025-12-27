
import React, { useState } from 'react';
import { Book } from './types';
import Shelf from './components/Shelf';
import Reader from './components/Reader';
import ImportPage from './components/ImportPage';
import LoginPage from './components/LoginPage';

const SAMPLE_BOOK: Book = {
  id: '1',
  title: '荷塘月色',
  author: '朱自清',
  content: `这几天心里颇不宁静。今晚在院子里坐着纳凉，忽然想起日日走过的荷塘，在这满月的光里，总该另有一番样子吧。月亮渐渐地升高了，墙外马路上孩子们的欢笑，已经听不见了；妻在屋里拍着闰儿，迷迷糊糊地哼着眠歌。我悄悄地披了大衫，带上门出去。

沿着荷塘，是一条曲折的小煤屑路。这是一条幽僻的路；白天也少人走，夜晚更加寂寞。荷塘四面，长着许多树，蓊蓊郁郁的。路的一旁，是些杨柳，和一些不知道名字的树。没有月光的晚上，这路上阴森森的，有些怕人。今晚却很好，虽然月光也还是淡淡的。

路上只我一个人，背着手踱着。这一片天地好像是我的；我也像超出了平常的自己，到了另一世界里。我爱热闹，也爱冷静；爱群居，也爱独处。像今晚上，一个人在这苍茫的月下，什么都可以想，什么都可以不想，便觉是个自由的人。白天里一定要做的事，一定要说的话，现在都可不理。这是独处的妙处，我且受用这无边的荷香月色好了。

曲曲折折的荷塘上面，弥望的是田田的叶子。叶子出水很高，像亭亭的舞女的裙。层层的叶子中间，零星地点缀着些白花，有袅娜地开着的，有羞涩地打着朵儿的；正如一粒粒的明珠，又如碧天里的星星，又如刚出浴的美人. 。微风过处，送来缕缕清香，仿佛远处高楼上渺茫的歌声似的。`,
  coverColor: '#FCAB47', // 呼应图片中的经典暖色
  height: 'h-[85%]'
};

const SAMPLE_BOOK_2: Book = {
  id: '2',
  title: '乡土中国',
  author: '费孝通',
  content: `从基层上看去，中国社会是乡土性的。那些被称土气的乡下人是中国社会的基层。我们说乡下人土气，虽则似乎带着几分藐视的意味，但这个土字用得很好。土字的基本意义是指泥土。乡下人离不了泥土，因为在乡下住，种地是最普通的谋生办法。在我们这土里刨食的世代，泥土是生命的根。

在乡村里，人与人的关系是熟悉的。我们大家是熟人，打个招呼，或者点个头，也就过去了。在熟悉的社会里，我们不需要法律。法律是现代社会的产物，在乡土社会里，我们有的是礼俗。礼俗是社会公认的行为规范，不需要文字的规定，是在生活中养成的习惯。`,
  coverColor: '#2B6D69', // 经典深青色
  height: 'h-[92%]'
};

const SAMPLE_BOOK_3: Book = {
  id: '3',
  title: '三体',
  author: '刘慈欣',
  content: `汪淼觉得，来找他的这两个人有些面熟。稍一回忆，他想起了那个长相粗鲁的中年人是史强，刑侦大队队长，几年前汪淼曾因一次被盗案同他打过交道。而那个年轻的军官，显然是史强的上级，因为史强对他透着一股子虽然粗鲁但明显的敬畏。

“汪教授，我们是来找你了解一些情况的。”史强大大咧咧地说，同时从衣袋里掏出一包烟，抽出一根递给汪淼。汪淼摆摆手谢绝了。史强自己点上，深吸了一口，烟雾喷到了汪淼的脸上。

“是关于‘科学边界’的事。”年轻军官说，他的声音很悦耳，但透着一股寒意。`,
  coverColor: '#D0604B', // 保持用户指定的红陶色
  height: 'h-[78%]'
};

type ViewState = 'LOGIN' | 'SHELF' | 'IMPORT' | 'READER';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LOGIN');
  const [library, setLibrary] = useState<Book[]>([SAMPLE_BOOK, SAMPLE_BOOK_2, SAMPLE_BOOK_3]);
  const [activeBook, setActiveBook] = useState<Book | null>(null);

  const handleSelectBook = (book: Book) => {
    setActiveBook(book);
    setView('READER');
  };

  const handleSaveBook = (book: Book) => {
    setLibrary([...library, book]);
    setView('SHELF');
  };

  const handleDeleteBook = (bookId: string) => {
    setLibrary((prev) => prev.filter((b) => b.id !== bookId));
  };

  const handleLogin = () => {
    setView('SHELF');
  };

  return (
    <div className="min-h-screen flex justify-center bg-gray-200 font-sans">
      <div className="w-full max-w-md h-[100dvh] relative overflow-hidden bg-[#FAF9F6] shadow-2xl flex flex-col">
        
        <div className="flex-1 overflow-hidden relative">
          {view === 'LOGIN' && (
            <LoginPage onLogin={handleLogin} />
          )}

          {view === 'SHELF' && (
            <Shelf 
              books={library} 
              onSelectBook={handleSelectBook} 
              onImportClick={() => setView('IMPORT')}
              onDeleteBook={handleDeleteBook}
            />
          )}

          {view === 'IMPORT' && (
            <ImportPage 
              onSave={handleSaveBook}
              onCancel={() => setView('SHELF')}
              existingBooks={library}
            />
          )}

          {view === 'READER' && activeBook && (
            <Reader 
              book={activeBook}
              onBack={() => setView('SHELF')}
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default App;
