'use client'

import { useState, useMemo } from 'react'
import * as Ph from '@phosphor-icons/react'

// ── Helper ────────────────────────────────────────────────────────────────────
function icon(name: string): { name: string; Icon: Ph.Icon } | null {
  const I = (Ph as Record<string, unknown>)[name] as Ph.Icon | undefined
  return I ? { name, Icon: I } : null
}
function icons(...names: string[]) {
  return names.map(icon).filter(Boolean) as { name: string; Icon: Ph.Icon }[]
}

// ── Icon catalogue (Figma Block 1 · node 1688-9260) ──────────────────────────

const CATEGORIES: { name: string; icons: { name: string; Icon: Ph.Icon }[] }[] = [
  {
    name: 'Arrows',
    icons: icons(
      'ArrowArcLeft','ArrowArcRight',
      'ArrowBendDoubleUpLeft','ArrowBendDoubleUpRight',
      'ArrowBendDownLeft','ArrowBendDownRight',
      'ArrowBendLeftDown','ArrowBendLeftUp',
      'ArrowBendRightDown','ArrowBendRightUp',
      'ArrowBendUpLeft','ArrowBendUpRight',
      'ArrowCircleDown','ArrowCircleDownLeft','ArrowCircleDownRight',
      'ArrowCircleLeft','ArrowCircleRight',
      'ArrowCircleUp','ArrowCircleUpLeft','ArrowCircleUpRight',
      'ArrowClockwise','ArrowCounterClockwise',
      'ArrowDown','ArrowDownLeft','ArrowDownRight',
      'ArrowElbowDownLeft','ArrowElbowDownRight',
      'ArrowElbowLeft','ArrowElbowLeftDown','ArrowElbowLeftUp',
      'ArrowElbowRight','ArrowElbowRightDown','ArrowElbowRightUp',
      'ArrowElbowUpLeft','ArrowElbowUpRight',
      'ArrowFatDown','ArrowFatLeft',
      'ArrowFatLineDown','ArrowFatLineLeft','ArrowFatLineRight','ArrowFatLineUp',
      'ArrowFatLinesDown','ArrowFatLinesLeft','ArrowFatLinesRight','ArrowFatLinesUp',
      'ArrowFatRight','ArrowFatUp',
      'ArrowLeft',
      'ArrowLineDown','ArrowLineDownLeft','ArrowLineDownRight',
      'ArrowLineLeft','ArrowLineRight',
      'ArrowLineUp','ArrowLineUpLeft','ArrowLineUpRight',
      'ArrowRight',
      'ArrowSquareDown','ArrowSquareDownLeft','ArrowSquareDownRight',
      'ArrowSquareIn','ArrowSquareLeft','ArrowSquareOut',
      'ArrowSquareRight','ArrowSquareUp','ArrowSquareUpLeft','ArrowSquareUpRight',
      'ArrowUDownLeft','ArrowUDownRight',
      'ArrowULeftDown','ArrowULeftUp',
      'ArrowURightDown','ArrowURightUp',
      'ArrowUUpLeft','ArrowUUpRight',
      'ArrowUp','ArrowUpLeft','ArrowUpRight',
      'ArrowsClockwise','ArrowsCounterClockwise',
      'ArrowsDownUp','ArrowsHorizontal',
      'ArrowsIn','ArrowsInCardinal','ArrowsInLineHorizontal','ArrowsInLineVertical','ArrowsInSimple',
      'ArrowsLeftRight','ArrowsMerge',
      'ArrowsOut','ArrowsOutCardinal','ArrowsOutLineHorizontal','ArrowsOutLineVertical','ArrowsOutSimple',
      'ArrowsSplit','ArrowsVertical',
      'CaretCircleDoubleDown','CaretCircleDoubleLeft','CaretCircleDoubleRight','CaretCircleDoubleUp',
      'CaretCircleDown','CaretCircleLeft','CaretCircleRight','CaretCircleUp','CaretCircleUpDown',
      'CaretDoubleDown','CaretDoubleLeft','CaretDoubleRight','CaretDoubleUp',
      'CaretDown','CaretLeft','CaretLineDown','CaretLineLeft','CaretLineRight','CaretLineUp',
      'CaretRight','CaretUp','CaretUpDown',
      'Recycle','VectorThree','VectorTwo',
    ),
  },
  {
    name: 'Communication',
    icons: icons(
      'AddressBook','AddressBookTabs',
      'Asterisk','AsteriskSimple','At',
      'Broadcast','CellTower',
      'Chat','ChatCentered','ChatCenteredDots','ChatCenteredSlash','ChatCenteredText',
      'ChatCircle','ChatCircleDots','ChatCircleSlash','ChatCircleText',
      'ChatDots','ChatSlash',
      'ChatTeardrop','ChatTeardropDots','ChatTeardropSlash','ChatTeardropText',
      'ChatText','Chats','ChatsCircle','ChatsTeardrop',
      'Cross',
      'Envelope','EnvelopeOpen','EnvelopeSimple','EnvelopeSimpleOpen',
      'Export',
      'Hash','HashStraight',
      'LetterCircleH','LetterCircleP','LetterCircleV',
      'Mailbox','MatrixLogo',
      'Megaphone','MegaphoneSimple',
      'Numpad',
      'PaperPlane','PaperPlaneRight','PaperPlaneTilt',
      'Peace',
      'Phone','PhoneCall','PhoneDisconnect','PhoneIncoming','PhoneList',
      'PhoneOutgoing','PhonePause','PhonePlus','PhoneSlash','PhoneTransfer','PhoneX',
      'Quotes','Radio',
      'Rss','RssSimple',
      'Share','ShareFat','ShareNetwork',
      'Signature',
      'Star','StarAndCrescent','StarHalf','StarOfDavid',
      'Sticker',
      'ThumbsDown','ThumbsUp',
      'Translate','Voicemail','YinYang',
    ),
  },
  {
    name: 'Design',
    icons: icons(
      'AlignBottom','AlignBottomSimple',
      'AlignCenterHorizontal','AlignCenterHorizontalSimple',
      'AlignCenterVertical','AlignCenterVerticalSimple',
      'AlignLeft','AlignLeftSimple',
      'AlignRight','AlignRightSimple',
      'AlignTop','AlignTopSimple',
      'Angle','BezierCurve','Blueprint','BoundingBox',
      'Circle','CircleDashed','CircleHalf','CircleHalfTilt','CircleNotch',
      'CirclesFour','CirclesThree','CirclesThreePlus',
      'Columns','ColumnsPlusLeft','ColumnsPlusRight',
      'CompassTool','Crop',
      'Cube','CubeTransparent','Cylinder',
      'DiamondsFour',
      'DropHalf','DropHalfBottom','DropSlash',
      'Eraser','Exclude','ExcludeSquare',
      'Eye','EyeClosed','EyeSlash','Eyedropper','EyedropperSample',
      'FlipHorizontal','FlipVertical','FlowArrow',
      'GearFine','Gradient',
      'GridFour','GridNine',
      'Hexagon','Highlighter','HighlighterCircle',
      'Intersect','IntersectSquare','IntersectThree',
      'Lasso','Layout',
      'LineSegment','LineSegments','LineVertical',
      'MagicWand','MarkerCircle',
      'Notches','Octagon',
      'PaintBrush','PaintBrushBroad','PaintBrushHousehold','PaintBucket','PaintRoller','Palette',
      'Parallelogram',
      'Pen','PenNib','PenNibStraight',
      'Pencil','PencilCircle','PencilLine','PencilRuler',
      'PencilSimple','PencilSimpleLine','PencilSimpleSlash','PencilSlash',
      'Pentagon','Pentagram','Perspective','Placeholder',
      'Polygon',
      'Rectangle','RectangleDashed','Resize',
      'Rows','RowsPlusBottom','RowsPlusTop','Ruler',
      'Scribble','ScribbleLoop','Scissors',
      'Selection','SelectionAll','SelectionBackground','SelectionForeground',
      'SelectionInverse','SelectionPlus','SelectionSlash',
      'Shapes',
      'Sidebar','SidebarSimple',
      'Sphere','SplitHorizontal','SplitVertical',
      'SprayBottle',
      'Square','SquareHalf','SquareHalfBottom',
      'SquareSplitHorizontal','SquareSplitVertical','SquaresFour',
      'Stack','StackMinus','StackPlus','StackSimple',
      'Stamp','Subtract','SubtractSquare',
      'Swatches','TextAUnderline',
      'Triangle','TriangleDashed',
      'Unite','UniteSquare','Vignette',
    ),
  },
  {
    name: 'Development',
    icons: icons(
      'Binary',
      'BracketsAngle','BracketsCurly','BracketsRound','BracketsSquare',
      'Bug','BugBeetle','BugDroid',
      'Code','CodeBlock','CodeSimple',
      'Cpu','Database',
      'GitBranch','GitCommit','GitDiff','GitFork','GitMerge','GitPullRequest',
      'GraphicsCard','HeadCircuit',
      'Magnet','MagnetStraight','MarkdownLogo',
      'Robot',
      'Terminal','TerminalWindow','TreeStructure',
      'Video','WebhooksLogo',
    ),
  },
  {
    name: 'Education',
    icons: icons(
      'Book','BookBookmark','BookOpen','BookOpenText','BookOpenUser',
      'Bookmark','BookmarkSimple','Bookmarks','BookmarksSimple','Books',
      'Certificate',
      'Chalkboard','ChalkboardSimple','ChalkboardTeacher',
      'Exam','GraduationCap',
      'Lectern','Student',
    ),
  },
  {
    name: 'Math & Finance',
    icons: icons(
      'ApproximateEquals','Bank','Calculator',
      'ChartBar','ChartBarHorizontal','ChartDonut','ChartLine','ChartLineDown','ChartLineUp',
      'ChartPie','ChartPieSlice','ChartPolar','ChartScatter',
      'Divide','Empty','Equals',
      'Function','Graph','GreaterThan','GreaterThanOrEqual',
      'Infinity','Intersection',
      'LessThan','LessThanOrEqual',
      'MathOperations','MemberOf','Minus','MinusCircle','MinusSquare',
      'NotEquals','NotMemberOf','NotSubsetOf','NotSupersetOf',
      'NumberCircleEight','NumberCircleFive','NumberCircleFour','NumberCircleNine',
      'NumberCircleOne','NumberCircleSeven','NumberCircleSix','NumberCircleThree',
      'NumberCircleTwo','NumberCircleZero',
      'NumberEight','NumberFive','NumberFour','NumberNine','NumberOne','NumberSeven','NumberSix',
      'NumberSquareEight','NumberSquareFive','NumberSquareFour','NumberSquareNine',
      'NumberSquareOne','NumberSquareSeven','NumberSquareSix','NumberSquareThree',
      'NumberSquareTwo','NumberSquareZero',
      'NumberThree','NumberTwo','NumberZero',
      'Percent','Pi','Plus','PlusCircle','PlusMinus','PlusSquare',
      'Radical','Sigma','SubsetOf','SubsetProperOf','SupersetOf','SupersetProperOf',
      'Table','Tilde','TrendDown','TrendUp','Union',
      'X','XCircle','XSquare',
    ),
  },
  {
    name: 'Media',
    icons: icons(
      'Airplay','Aperture','Article','ArticleMedium','ArticleNyTimes',
      'Camera','CameraPlus','CameraRotate','CameraSlash',
      'CassetteTape','ClosedCaptioning','Copyleft','Copyright','CornersIn','CornersOut',
      'Disc','Ear','EarSlash','Eject','EjectSimple','Equalizer',
      'Faders','FadersHorizontal','FastForward','FastForwardCircle',
      'FilmReel','FilmScript','FilmSlate','FilmStrip',
      'FourK','FrameCorners','Gif','Guitar',
      'Headphones','Headset','HighDefinition',
      'Image','ImageBroken','ImageSquare','Images','ImagesSquare',
      'Metronome','Microphone','MicrophoneSlash','MicrophoneStage',
      'MusicNote','MusicNoteSimple','MusicNotes','MusicNotesMinus','MusicNotesPlus','MusicNotesSimple',
      'Newspaper','NewspaperClipping','Panorama',
      'Pause','PauseCircle','PianoKeys','PictureInPicture',
      'Play','PlayCircle','PlayPause','Playlist',
      'Queue','Record','Repeat','RepeatOnce','Rewind','RewindCircle',
      'Screencast','Shuffle','ShuffleAngular','ShuffleSimple',
      'SkipBack','SkipBackCircle','SkipForward','SkipForwardCircle',
      'Sliders','SlidersHorizontal','Slideshow',
      'SpeakerHifi','SpeakerHigh','SpeakerLow','SpeakerNone',
      'SpeakerSimpleHigh','SpeakerSimpleLow','SpeakerSimpleNone','SpeakerSimpleSlash','SpeakerSimpleX',
      'SpeakerSlash','SpeakerX','StandardDefinition','Stop','StopCircle',
      'Subtitles','SubtitlesSlash','Television','TelevisionSimple',
      'ThreeD','VideoCamera','VideoCameraSlash','VideoConference','VinylRecord','Visor',
      'WaveSawtooth','WaveSine','WaveSquare','WaveTriangle','Waveform','WaveformSlash',
      'Webcam','WebcamSlash',
    ),
  },
  {
    name: 'Office & Editing',
    icons: icons(
      'Archive','BoxArrowDown','BoxArrowUp','Briefcase','BriefcaseMetal',
      'Cards','CardsThree','Clipboard','ClipboardText',
      'Copy','CopySimple','CursorText',
      'File','FileArchive','FileArrowDown','FileArrowUp',
      'FileAudio','FileC','FileCSharp','FileCloud','FileCode','FileCpp','FileCss','FileCsv',
      'FileDashed','FileDoc','FileHtml','FileImage','FileIni','FileJpg','FileJs','FileJsx',
      'FileLock','FileMagnifyingGlass','FileMd','FileMinus','FilePdf','FilePlus','FilePng','FilePpt',
      'FilePy','FileRs','FileSql','FileSvg','FileText','FileTs','FileTsx','FileTxt',
      'FileVideo','FileVue','FileX','FileXls','FileZip','Files',
      'FloppyDisk','FloppyDiskBack',
      'Folder','FolderDashed','FolderLock','FolderMinus','FolderOpen','FolderPlus',
      'FolderSimple','FolderSimpleDashed','FolderSimpleLock','FolderSimpleMinus','FolderSimplePlus',
      'FolderSimpleStar','FolderSimpleUser','FolderStar','FolderUser','Folders',
      'Funnel','FunnelSimple','FunnelSimpleX','FunnelX',
      'Kanban','List','ListBullets','ListChecks','ListDashes','ListNumbers','ListPlus',
      'Note','NoteBlank','NotePencil','Notebook','Notepad',
      'Paperclip','PaperclipHorizontal','Paragraph',
      'Presentation','PresentationChart','Printer','ProjectorScreen','ProjectorScreenChart',
      'PushPin','PushPinSimple','PushPinSimpleSlash','PushPinSlash',
      'SortAscending','SortDescending',
      'TextAa','TextAlignCenter','TextAlignJustify','TextAlignLeft','TextAlignRight',
      'TextB','TextColumns','TextH','TextHFive','TextHFour','TextHOne','TextHSix','TextHThree','TextHTwo',
      'TextIndent','TextItalic','TextOutdent','TextStrikethrough',
      'TextSubscript','TextSuperscript','TextT','TextTSlash','TextUnderline','Textbox',
      'Trash','TrashSimple','Tray','TrayArrowDown','TrayArrowUp',
    ),
  },
  {
    name: 'People',
    icons: icons(
      'Baby','Eyes','Footprints',
      'GenderFemale','GenderIntersex','GenderMale','GenderNeuter','GenderNonbinary','GenderTransgender',
      'Hand','HandArrowDown','HandArrowUp','HandDeposit','HandEye','HandFist','HandGrabbing',
      'HandPalm','HandPeace','HandPointing','HandWaving','HandWithdraw',
      'HandsClapping','HandsPraying','Handshake',
      'IdentificationBadge','IdentificationCard',
      'Person','PersonArmsSpread',
      'PersonSimple','PersonSimpleBike','PersonSimpleCircle','PersonSimpleHike','PersonSimpleRun',
      'PersonSimpleSwim','PersonSimpleTaiChi','PersonSimpleThrow','PersonSimpleWalk',
      'Smiley','SmileyAngry','SmileyBlank','SmileyMeh','SmileyMelting',
      'SmileyNervous','SmileySad','SmileySticker','SmileyWink','SmileyXEyes',
      'User','UserCheck','UserCircle','UserCircleCheck','UserCircleDashed','UserCircleGear',
      'UserCircleMinus','UserCirclePlus','UserFocus',
      'UserGear','UserList','UserMinus','UserPlus','UserRectangle','UserSound','UserSquare','UserSwitch',
      'Users','UsersFour','UsersThree',
      'Wheelchair','WheelchairMotion',
    ),
  },
  {
    name: 'System & Devices',
    icons: icons(
      // App windows & browsers
      'AppWindow','Browser','Browsers',
      // Battery
      'BatteryCharging','BatteryChargingVertical',
      'BatteryEmpty','BatteryFull','BatteryHigh','BatteryLow','BatteryMedium',
      'BatteryPlus','BatteryPlusVertical',
      'BatteryVerticalEmpty','BatteryVerticalFull','BatteryVerticalHigh','BatteryVerticalLow','BatteryVerticalMedium',
      'BatteryWarning','BatteryWarningVertical',
      // Bells & notifications
      'Bell','BellRinging','BellSimple','BellSimpleRinging','BellSimpleSlash','BellSimpleZ',
      'BellSlash','BellZ','Notification',
      // Bluetooth
      'Bluetooth','BluetoothConnected','BluetoothSlash','BluetoothX',
      // Cell signal
      'CellSignalFull','CellSignalHigh','CellSignalLow','CellSignalMedium',
      'CellSignalNone','CellSignalSlash','CellSignalX',
      // Checks
      'Check','CheckCircle','CheckFat','CheckSquare','CheckSquareOffset','Checks',
      // Cloud
      'CloudArrowDown','CloudArrowUp','CloudCheck','CloudSlash','CloudWarning','CloudX',
      // Computers & displays
      'Command','ComputerTower','Control',
      'Cursor','CursorClick',
      'Desktop','DesktopTower',
      'DeviceMobile','DeviceMobileCamera','DeviceMobileSlash','DeviceMobileSpeaker',
      'DeviceRotate',
      'DeviceTablet','DeviceTabletCamera','DeviceTabletSpeaker',
      'Devices',
      'Download','DownloadSimple',
      // Dots
      'Dot','DotOutline','DotsNine','DotsSix','DotsSixVertical',
      'DotsThree','DotsThreeCircle','DotsThreeCircleVertical',
      'DotsThreeOutline','DotsThreeOutlineVertical','DotsThreeVertical',
      // Flashlight, gear, gauge
      'Flashlight','Gauge','Gear','GearSix',
      // Hands (interaction)
      'HandSwipeLeft','HandSwipeRight','HandTap',
      // Hard drives
      'HardDrive','HardDrives',
      // Keyboard
      'Keyboard','KeyReturn',
      // Laptop
      'Laptop',
      // Lightning
      'Lightning','LightbulbFilament','Lightbulb','LightningA','LightningSlash',
      // Links
      'Link','LinkBreak','LinkSimple','LinkSimpleBreak','LinkSimpleHorizontal','LinkSimpleHorizontalBreak',
      // List search variants
      'ListHeart','ListMagnifyingGlass','ListStar',
      // Magnifying glass
      'MagnifyingGlass','MagnifyingGlassMinus','MagnifyingGlassPlus',
      // Memory & circuitry
      'Circuitry','Memory',
      // Monitor
      'Monitor','MonitorArrowUp','MonitorPlay',
      // Mouse
      'Mouse','MouseLeftClick','MouseMiddleClick','MouseRightClick','MouseScroll','MouseSimple',
      // Network
      'Network','NetworkSlash','NetworkX',
      // Misc hardware
      'Nut','Option',
      'Plug','PlugCharging','Plugs','PlugsConnected',
      'Power',
      'QrCode',
      'RadioButton',
      'Scan','ScanSmiley',
      'SignIn','SignOut',
      'SimCard',
      'Speedometer',
      'Spinner','SpinnerBall','SpinnerGap',
      'Swap',
      'Tabs',
      'ToggleLeft','ToggleRight',
      'TreeView',
      'Upload','UploadSimple',
      'Usb',
      'Vibrate',
      // Wifi
      'WifiHigh','WifiLow','WifiMedium','WifiNone','WifiSlash','WifiX',
    ),
  },
  {
    name: 'Security & Warnings',
    icons: icons(
      'Biohazard','Detective','ExclamationMark','FalloutShelter',
      'Fingerprint','FingerprintSimple','FireExtinguisher',
      'Info','Key','Keyhole',
      'Lock','LockKey','LockKeyOpen','LockLaminated','LockLaminatedOpen','LockOpen',
      'LockSimple','LockSimpleOpen',
      'Password','Prohibit','ProhibitInset',
      'Question','QuestionMark','Radioactive',
      'Seal','SealCheck','SealPercent','SealQuestion','SealWarning',
      'SecurityCamera','Shield','ShieldCheck','ShieldCheckered','ShieldChevron',
      'ShieldPlus','ShieldSlash','ShieldStar','ShieldWarning',
      'Siren','Vault','Wall',
      'Warning','WarningCircle','WarningDiamond','WarningOctagon',
    ),
  },
]

// ── Design tokens (match Tab component) ──────────────────────────────────────
const FILTER = {
  groupBg:      '#eff1f3',
  activeBg:     '#ffffff',
  activeBorder: '#689df6',
  activeText:   '#4285f4',
  defaultText:  '#021920',
  hoverBg:      'rgba(255,255,255,0.65)',
  disabledText: '#aab0b8',
}

// ── Component ─────────────────────────────────────────────────────────────────
export function IconGrid() {
  const [query,    setQuery]    = useState('')
  const [category, setCategory] = useState('All')
  const [copied,   setCopied]   = useState<string | null>(null)
  const [hovered,  setHovered]  = useState<string | null>(null)

  // Derive what to display
  const display = useMemo(() => {
    const q = query.trim().toLowerCase()

    if (q) {
      // Search across all categories
      const matches = CATEGORIES.flatMap((cat) =>
        cat.icons
          .filter((i) => i.name.toLowerCase().includes(q))
          .map((i) => ({ ...i, category: cat.name })),
      )
      return [{ name: 'Search results', icons: matches }]
    }

    if (category === 'All') {
      return CATEGORIES
    }

    const cat = CATEGORIES.find((c) => c.name === category)
    return cat ? [cat] : []
  }, [query, category])

  const totalShown = display.reduce((n, g) => n + g.icons.length, 0)

  function copy(name: string) {
    navigator.clipboard.writeText(`<${name} />`)
    setCopied(name)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div>
      {/* ── Search ──────────────────────────────────────────────────────── */}
      <div className="relative mb-4 max-w-sm">
        <Ph.MagnifyingGlass
          className="absolute left-3 top-1/2 -translate-y-1/2"
          size={14}
          style={{ color: 'var(--color-text-secondary)' }}
        />
        <input
          type="search"
          placeholder="Search icons…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setCategory('All') }}
          className="w-full pl-8 pr-3 py-2 text-sm rounded-md border outline-none focus:ring-2"
          style={{
            borderColor:       'var(--color-border)',
            backgroundColor:   'var(--color-surface-form-field)',
            color:             'var(--color-text-primary)',
            // @ts-expect-error CSS custom property
            '--tw-ring-color': 'var(--color-primary)',
          }}
        />
      </div>

      {/* ── Category filter strip ────────────────────────────────────────── */}
      {!query && (
        <div
          style={{
            display:      'inline-flex',
            alignItems:   'center',
            gap:           4,
            padding:       4,
            borderRadius:  4,
            background:   FILTER.groupBg,
            marginBottom: 20,
            flexWrap:     'wrap',
          }}
        >
          {['All', ...CATEGORIES.map((c) => c.name)].map((cat) => {
            const active = category === cat
            const isHov  = hovered === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                onMouseEnter={() => setHovered(cat)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display:      'inline-flex',
                  alignItems:   'center',
                  padding:      '4px 12px',
                  borderRadius:  4,
                  border:       active ? `1px solid ${FILTER.activeBorder}` : '1px solid transparent',
                  background:   active ? FILTER.activeBg : isHov ? FILTER.hoverBg : 'transparent',
                  cursor:       'pointer',
                  userSelect:   'none',
                  fontSize:      10,
                  fontWeight:    600,
                  lineHeight:   '12px',
                  letterSpacing:'0.4px',
                  color:        active ? FILTER.activeText : FILTER.defaultText,
                  transition:   'all 100ms ease',
                  whiteSpace:   'nowrap',
                }}
              >
                {cat}
                {cat !== 'All' && (
                  <span
                    style={{
                      marginLeft:    6,
                      fontSize:       9,
                      fontWeight:    400,
                      opacity:       0.6,
                      color:        'inherit',
                    }}
                  >
                    {CATEGORIES.find((c) => c.name === cat)?.icons.length ?? 0}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Count ───────────────────────────────────────────────────────── */}
      <p className="text-xs mb-5" style={{ color: 'var(--color-text-secondary)' }}>
        {totalShown} icon{totalShown !== 1 ? 's' : ''}
        {query
          ? ` matching "${query}"`
          : category !== 'All'
          ? ` in ${category}`
          : ' total'}
      </p>

      {/* ── Icon groups ─────────────────────────────────────────────────── */}
      {display.map((group) => (
        <div key={group.name} className="mb-10">
          {/* Category heading — only show when browsing all or search results */}
          {(category === 'All' || query) && (
            <h3
              className="text-xs font-semibold uppercase tracking-wider mb-3 pb-2 border-b"
              style={{
                color:       'var(--color-text-secondary)',
                borderColor: 'var(--color-border)',
              }}
            >
              {group.name}
              <span
                className="ml-2 font-normal normal-case tracking-normal"
                style={{ opacity: 0.55 }}
              >
                {group.icons.length}
              </span>
            </h3>
          )}

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
            {group.icons.map(({ name, Icon }) => (
              <button
                key={name}
                onClick={() => copy(name)}
                title={`${name} — click to copy JSX`}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-colors cursor-pointer"
                style={{
                  borderColor:     copied === name ? 'var(--color-primary)' : 'var(--color-border)',
                  backgroundColor: copied === name ? 'var(--color-info-100)' : 'var(--color-surface-section)',
                }}
              >
                <Icon size={20} style={{ color: 'var(--color-text-primary)' }} />
                <span
                  className="text-[9px] text-center leading-tight break-all w-full"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {copied === name ? '✓ Copied' : name}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {totalShown === 0 && (
        <p className="text-sm text-center py-12" style={{ color: 'var(--color-text-secondary)' }}>
          No icons match &ldquo;{query}&rdquo;
        </p>
      )}
    </div>
  )
}
