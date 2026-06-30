import { darken } from '@mui/material/styles';
import * as _ from 'lodash-es';
import bgLogin from 'src/assets/bg-login.jpg';
import groupChatPlaceholder from 'src/assets/group-chat-placeholder.png';
import logo from 'src/assets/keephub-logo-white.svg';
import newsPreviewPlaceholder from 'src/assets/kega-news-placeholder.png';
import smallProfileImagePlaceholder from 'src/assets/small-profile-image-placeholder.png';

export const themeSettings = {
  webFontLoaderConfig: {
    google: {
      families: ['Source Sans Pro:400,600', 'Material Icons'],
    },
  },
  typography: {
    fontFamily: '"Source Sans Pro", "Helvetica Neue", Arial, sans-serif',
  },
  colors: {
    bottomNavigationAction: '#999999',
    bottomNavigationActiveColor: '#fff',
    bottomNavigationBackgroundColor: '#373132',
    primary: '#F0545D',
    primaryContrastText: '#ffffff',
    primaryHover: 'rgba(240, 84, 93, 0.75)',
    secondary: '#373132',
    secondaryContrastText: '#ffffff',
    secondaryHover: '#5f5a5b',
    topBarBackground: '#373132',
    topBarHover: '#5f5a5b',
    topBarText: '#fff',
  },
  borderRadius: 8,
  borderRadiusRound: '50%',
  spacingUnit: 8,
  footerBarHeight: 56,
  appBarHeight: 53,
  mainAppBarHeight: 56,
  editPagesMenuHeight: 180,
  sideBarWidth: 80,
  contentDetailWidth: 670,
  taskProgressPageWidth: 670,
  logoWrapperHeight: 100,
  logoWrapperHeightMobile: 56,
  smallNewsItemPreviewHeight: 96,
  taskSuperviseHeaderHeight: 250,
  taskSuperviseHeaderHeightMobile: 180,
  previewListItemHeight: 72,
  chatOverlayWidth: 360,
  leftNavExpandedWidth: 240,
  leftNavCollapsedWidth: 75,
  placeholders: {
    smallProfileImage: smallProfileImagePlaceholder,
    newsPreview: newsPreviewPlaceholder,
    groupChat: groupChatPlaceholder,
  },
  logoImage: logo,
  brandedPageLogo: logo,
  brandedPageLogoHeight: 64,
  brandedPageBackground: bgLogin,
  brandedPageBackgroundPosition: '50% 50%',
  homepageBlocksBackground: bgLogin,
  homepageBlocksBackgroundPosition: '50% 0',
};

// This is the non-customisable part of the theme settings.
const getNonCustomizableThemeSettings = () => ({
  colors: {
    appBackground: '#efefef',
    attachments: {
      word: '#295896',
      excel: '#1b7541',
      ppt: '#c53d1c',
      video: '##494949',
      pdf: '#b50a00',
      image: '#9C27B0',
    },
    backgroundDefault: '#efefef',
    backgroundMedium: '#888',
    backgroundMediumHover: '#b9b9b9',
    backgroundPaper: '#fff',
    backgroundPrimaryLight: '#fff7fa',
    backgroundPrimaryLightHover: '#ffe6ef',
    backgroundUnread: '#fafafa',
    divider: '#d5d7dd',
    error: '#d00',
    errorBg: 'rgba(221, 0, 0, 0.1)',
    errorText: '#fff',
    labelColor: '#858585',
    info: '#286BA4',
    lightboxBackground: 'rgba(0, 0, 0, 0.88)',
    lightboxButtonBackground: 'rgba(255, 255, 255, 0.1)',
    rating: {
      veryLow: '#c72c2c',
      low: '#fd861c',
      medium: '#286ba4',
      high: '#81c037',
      veryHigh: '#417505',
    },
    successBg: '#43a047',
    successText: '#fff',
    textDisabled: '#858585',
    textHint: '#888',
    textPrimary: '#444',
    textSecondary: '#666',
    white: '#fff',
    table: {
      headerBackground: '#888',
      headerBackgroundHover: '#b9b9b9',
      headerText: '#fff',
      oddRowBackground: '#fafafa',
      evenRowBackground: '#fff',
      hoverRowBackground: '#eee',
    },
    errorColors: {
      main: '#cf405b',
      light: '#d65c72',
      dark: '#b82e47',
      contrastText: '#fff',
    },
    infoColors: {
      main: '#0b7dba',
      light: '#0e9eec',
      dark: '#085e8c',
      contrastText: '#fff',
    },
    successColors: {
      main: '#44a047',
      light: '#5dbb60',
      dark: '#357e37',
      contrastText: '#fff',
    },
    customRadioButtonBackground: '#f8f8f8',
    funnelGraphBarColor: '#F9BBBE',
    funnelGraphBarGradientColors: {
      low: '#156b65',
      medium: '#18877f',
      high: '#21b3a8',
    },
    funnelGraphBarBorderColor: '#F4848B',
  },
  widgetFooterHeight: 56,
  shadows: {
    1: '0 2px 2px 0 rgba(0, 0, 0, 0.16), 0 0 2px 0 rgba(0, 0, 0, 0.16)',
    2: '0 3px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.12)',
    3: '0 6px 6px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.12)',
    4: '0 10px 10px 0 rgba(0, 0, 0, 0.12), 0 0 10px 0 rgba(0, 0, 0, 0.12)',
  },
  insets: {
    top:
      getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top') ||
      getComputedStyle(document.documentElement).getPropertyValue('--inset-top') ||
      0,
    bottom:
      getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') ||
      getComputedStyle(document.documentElement).getPropertyValue('--inset-bottom') ||
      0,
    left:
      getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-left') ||
      getComputedStyle(document.documentElement).getPropertyValue('--inset-left') ||
      0,
    right:
      getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-right') ||
      getComputedStyle(document.documentElement).getPropertyValue('--inset-right') ||
      0,
  },
});

export function createTheme(settings) {
  const ts = _.merge(settings, getNonCustomizableThemeSettings());

  return {
    appBackground: ts.appBackground,
    logo: {
      image: ts.logoImage,
      style: {
        width: '100%',
        height: 48,
        background: `url('${ts.logoImage}') no-repeat 50% 50%`,
        backgroundSize: 'contain',
        textIndent: '-999em',
      },
      mobileStyle: {
        height: '60%',
      },
    },
    brandedPage: {
      backgroundImage: ts.brandedPageBackground,
      backgroundPosition: ts.brandedPageBackgroundPosition,
      logo: ts.brandedPageLogo,
      logoHeight: ts.brandedPageLogoHeight,
    },
    homepageBlocks: {
      page: {
        background: `url('${ts.homepageBlocksBackground}') no-repeat ${ts.homepageBlocksBackgroundPosition}`,
        backgroundSize: 'cover',
      },
    },
    placeholders: ts.placeholders,
    pageContainer: {
      padding: ts.spacingUnit,
      paddingBottom: ts.spacingUnit * 2,
    },
    appBarHeight: ts.appBarHeight,
    mainAppBarHeight: ts.mainAppBarHeight,
    editPagesMenuHeight: ts.editPagesMenuHeight,
    sideBarWidth: ts.sideBarWidth,
    footerBarHeight: ts.footerBarHeight,
    taskSuperviseHeaderHeight: ts.taskSuperviseHeaderHeight,
    taskSuperviseHeaderHeightMobile: ts.taskSuperviseHeaderHeightMobile,
    logoWrapperHeight: ts.logoWrapperHeight,
    logoWrapperHeightMobile: ts.logoWrapperHeightMobile,
    contentDetailWidth: ts.contentDetailWidth,
    taskProgressPageWidth: ts.taskProgressPageWidth,
    smallNewsItemPreviewHeight: ts.smallNewsItemPreviewHeight,
    chatOverlayWidth: ts.chatOverlayWidth,
    previewListItemHeight: ts.previewListItemHeight,
    leftNavExpandedWidth: ts.leftNavExpandedWidth,
    leftNavCollapsedWidth: ts.leftNavCollapsedWidth,
    insets: ts.insets,
    widgetFooterHeight: ts.widgetFooterHeight,
    palette: {
      primary: {
        main: ts.colors.primary,
        contrastText: ts.colors.primaryContrastText,
        hover: ts.colors.primaryHover,
      },
      secondary: {
        main: ts.colors.secondary,
        contrastText: ts.colors.secondaryContrastText,
        hover: ts.colors.secondaryHover,
      },
      menu: {
        background: ts.colors.menu || ts.colors.secondary,
        contrastText: ts.colors.menuContrastText || ts.colors.secondaryContrastText,
        hover: ts.colors.menuHover || ts.colors.secondaryHover,
      },
      background: {
        default: ts.colors.backgroundDefault,
        paper: ts.colors.backgroundPaper,
        unread: ts.colors.backgroundUnread,
        mediumHover: ts.colors.backgroundMediumHover,
        barelyWhite: ts.colors.barelyWhite,
        customRadioButton: ts.colors.customRadioButtonBackground,
      },
      text: {
        primary: ts.colors.textPrimary,
        secondary: ts.colors.textSecondary,
        hint: ts.colors.textHint,
        disabled: ts.colors.textDisabled,
        label: ts.colors.labelColor,
      },
      error: ts.colors.errorColors,
      info: ts.colors.infoColors,
      attachments: ts.colors.attachments,
      success: ts.colors.successColors,
      lightbox: {
        buttonBackground: ts.colors.lightboxButtonBackground,
        background: ts.colors.lightboxBackground,
      },
      divider: ts.colors.divider,
      bottomNavigationActiveColor: ts.colors.bottomNavigationActiveColor,
      bottomNavigationAction: ts.colors.bottomNavigationAction,
      topBar: {
        background: ts.colors.topBarBackground,
        hover: ts.colors.topBarHover,
        text: ts.colors.topBarText,
      },
      rating: ts.colors.rating,
      chartColors: {
        funnelGraphBar: ts.colors.funnelGraphBarColor,
        funnelGraphBarGradientColors: {
          low: ts.colors.funnelGraphBarGradientColors.low,
          medium: ts.colors.funnelGraphBarGradientColors.medium,
          high: ts.colors.funnelGraphBarGradientColors.high,
        },
      },
    },
    shape: {
      borderRadius: ts.borderRadius,
      borderRadiusRound: ts.borderRadiusRound,
    },
    spacing: ts.spacingUnit,

    typography: {
      // Use the system font instead of the default Roboto font.
      fontUrl: ts.typography.fontUrl,
      iconFontUrl: ts.typography.iconFontUrl,
      fontFamily: ts.typography.fontFamily,

      useNextVariants: true,
      fontWeightLight: 400,
      fontWeightRegular: 400,
      fontWeightMedium: 600,
      fontWeightBold: 600,
      h2: {
        fontSize: '1.5rem',
        lineHeight: '1.33333em',
        color: ts.colors.textPrimary,
        fontWeight: 600,
      },
      h3: {
        fontSize: '1.25rem',
        lineHeight: '1.2em',
        color: ts.colors.textPrimary,
        fontWeight: 600,
      },
      h4: {
        fontSize: '1rem',
        lineHeight: '1.5em',
        color: ts.colors.textPrimary,
        fontWeight: 600,
      },
      h5: {
        fontSize: '1rem',
        lineHeight: '1.1875em',
        color: ts.colors.textPrimary,
        fontWeight: 600,
      },
      h6: {
        fontSize: '0.875rem',
        lineHeight: '1.2857em',
        color: ts.colors.textPrimary,
        fontWeight: 600,
      },
      subtitle1: {
        fontSize: '0.875rem',
        lineHeight: '1.2857em',
        color: ts.colors.textSecondary,
        fontWeight: 400,
      },
      subtitle2: {
        fontSize: '0.875rem',
        lineHeight: '1.2857em',
        color: ts.colors.textHint,
        fontWeight: 400,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: '1.2857em',
        color: ts.colors.textSecondary,
        fontWeight: 400,
      },
      body1: {
        fontSize: '0.875rem',
        lineHeight: '1.5em',
        color: ts.colors.textSecondary,
        fontWeight: 400,
      },
      caption: {
        fontSize: '0.6875rem',
        lineHeight: '1.4545em',
        color: ts.colors.textHint,
        fontWeight: 400,
      },
      button: {
        fontSize: '1rem',
        lineHeight: '1.1875em',
        fontWeight: 600,
        textTransform: 'none',
        '&:hover': {
          color: ts.colors.primary,
        },
      },
    },
    shadows: [
      'none',
      ts.shadows[1],
      ts.shadows[1],
      ts.shadows[1],
      ts.shadows[1],
      ts.shadows[1],
      ts.shadows[1],
      ts.shadows[2],
      ts.shadows[2],
      ts.shadows[2],
      ts.shadows[2],
      ts.shadows[2],
      ts.shadows[2],
      ts.shadows[3],
      ts.shadows[3],
      ts.shadows[3],
      ts.shadows[3],
      ts.shadows[3],
      ts.shadows[3],
      ts.shadows[4],
      ts.shadows[4],
      ts.shadows[4],
      ts.shadows[4],
      ts.shadows[4],
      ts.shadows[4],
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            minWidth: 100,
            minHeight: 32,
            padding: `0 ${ts.spacingUnit * 2}px`,
            borderRadius: 999,
          },
          sizeSmall: {
            minWidth: 90,
            minHeight: 28,
            fontSize: '0.75rem',
          },
          contained: {
            boxShadow: 'none',
          },
          containedPrimary: {
            '&:hover': {
              backgroundColor: ts.colors.primaryHover,
            },
          },
          containedSecondary: {
            '&:hover': {
              backgroundColor: ts.colors.secondaryHover,
            },
          },
        },
      },
      MuiButtonGroup: {
        styleOverrides: {
          root: {
            borderRadius: 999,
          },
          grouped: {
            minWidth: 32,
            '&:not(:last-child)': {
              borderRightColor: ts.colors.white,
            },
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: { paddingBottom: ts.insets.bottom },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            '&.section': {
              paddingBottom: ts.spacingUnit * 2,
            },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            '&.Mui-disabled': {
              color: darken(ts.colors.labelColor, 0.2),
            },
          },
        },
      },
      MuiFilledInput: {
        styleOverrides: {
          root: {
            backgroundColor: ts.colors.backgroundDefault,
            fontSize: '0.875rem',
            lineHeight: '1.2857em',
            borderRadius: ts.borderRadius,
          },
          multiline: {
            paddingTop: '14px',
            paddingBottom: ts.spacingUnit * 2,
          },
          inputMultiline: {
            borderRadius: 0,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
              width: '0px',
            },
          },
          input: {
            padding: ts.spacingUnit * 2,
            fontSize: '1rem',
            lineHeight: '1.2857em',
            borderRadius: ts.borderRadius,
            '&[type=color]': {
              fontSize: '2rem',
              padding: ts.spacingUnit / 2,
            },
          },
          underline: {
            '&:after': {
              borderBottom: 0,
            },
            '&:before, &:hover:before': {
              borderBottom: '0 !important',
            },
            '&.Mui-disabled:before': { borderBottom: 0 },
          },
          adornedEnd: {
            paddingRight: `0 !important`,
          },
          adornedStart: {
            paddingLeft: ts.spacingUnit,
          },
        },
      },
      MuiPickersFilledInput: {
        styleOverrides: {
          root: {
            borderBottomLeftRadius: ts.borderRadius,
            borderBottomRightRadius: ts.borderRadius,
            '& .MuiPickersInputBase-sectionsContainer': {
              paddingTop: ts.spacingUnit * 2,
              paddingBottom: ts.spacingUnit * 2,
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          filled: {
            transform: 'translate(16px, 16px) scale(1)',
            fontSize: '0.875rem',
            lineHeight: '1.2857em',
            color: ts.colors.labelColor,
            '&.MuiInputLabel-shrink': {
              transform: 'translate(16px, 5px) scale(0.57)',
              transformOrigin: 'top left',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '170%',
            },
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          contained: {
            margin: `${ts.spacingUnit / 2}px ${ts.spacingUnit * 2}px 0`,
          },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem',
            lineHeight: '1.2857em',
            color: ts.colors.textPrimary,
            maxWidth: `calc(100% - ${ts.spacingUnit * 4}px)`,
            paddingRight: ts.spacingUnit * 4,
            '&:hover:not(.Mui-disabled):not(.Mui-focused):not(.Mui-error), &:hover:not(.Mui-disabled):not(.Mui-focused):not(.Mui-error) svg': {
              color: ts.colors.primary,
            },
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            padding: '12px 14px 12px 10px',
            '& svg': {
              fontSize: '1rem',
            },
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            padding: '12px',
            '& svg': {
              fontSize: '1rem',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            '&.app-bar-dialog': {
              boxShadow: 'none',
              borderBottom: `1px solid ${ts.colors.backgroundDefault}`,
            },
            '&.app-bar-dialog > div': {
              minHeight: ts.appBarHeight,
              padding: 0,
            },
            '& .dialog-title': {
              flexGrow: 1,
              fontSize: '1rem',
              lineHeight: '1.1875em',
              padding: `0 ${ts.spacingUnit * 2}px`,
              fontWeight: 600,
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            padding: ts.spacingUnit,
            fontSize: '1rem',
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            fontSize: '1rem',
          },
        },
      },
      MuiIcon: {
        styleOverrides: {
          root: {
            fontSize: '1rem',
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            borderRadius: 999,
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          edgeEnd: {
            marginRight: -ts.spacingUnit * 3,
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            paddingTop: ts.spacingUnit,
            paddingBottom: ts.spacingUnit,
            paddingLeft: ts.spacingUnit * 2,
            paddingRight: ts.spacingUnit * 2,
          },
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: {
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: ts.spacingUnit * 2,
            paddingRight: ts.spacingUnit * 2,
          },
          action: {
            display: 'flex',
            margin: 0,
            paddingTop: ts.spacingUnit * 2,
          },
          avatar: {
            width: 20,
            marginRight: ts.spacingUnit,
            display: 'flex',
          },
          content: {
            flex: '1 1 auto',
            overflow: 'hidden',
            marginRight: ts.spacingUnit,
            paddingTop: ts.spacingUnit * 2,
            paddingBottom: ts.spacingUnit * 2,
          },
          title: {
            display: 'flex',
            alignItems: 'center',
          },
        },
      },
      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            height: ts.footerBarHeight,
            boxShadow: ts.shadows[1],
            background: ts.colors.bottomNavigationBackgroundColor,
          },
        },
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            minWidth: 50,
            height: ts.footerBarHeight,
            padding: ts.spacingUnit,
            color: ts.colors.bottomNavigationAction,
            '&.MuiBottomNavigationAction-iconOnly': {
              paddingTop: ts.spacingUnit,
            },
          },
        },
        label: {
          styleOverrides: {
            color: ts.colors.white,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            overflowWrap: 'break-word',
            '& [href], &[href]': {
              color: ts.colors.primary,
              textDecoration: 'none',
            },
            '& [href]:hover, &[href]:hover': {
              color: ts.colors.primaryHover,
            },
          },
        },
      },
      MuiSpeedDial: {
        styleOverrides: {
          root: {
            '& > button:hover': {
              boxShadow: '0 3px 9px 1px rgba(221, 0, 92, 0.82);',
            },
          },
        },
      },
      MuiSpeedDialIcon: {
        styleOverrides: {
          icon: {
            fontSize: '1.5em',
          },
        },
      },
      MuiSpeedDialAction: {
        styleOverrides: {
          staticTooltipLabel: {
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:nth-of-type(odd)': {
              backgroundColor: ts.colors.table.oddRowBackground,
            },
            '&:nth-of-type(even)': {
              backgroundColor: ts.colors.table.evenRowBackground,
            },
            '&:hover': {
              backgroundColor: ts.colors.table.hoverRowBackground,
            },
            height: ts.spacingUnit * 3,
          },
          head: {
            height: ts.spacingUnit * 4,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderRight: `${ts.spacingUnit / 2}px solid ${ts.colors.white}`,
            paddingLeft: ts.spacingUnit * 2,
            paddingRight: ts.spacingUnit * 2,
            '&:last-child': {
              borderRightWidth: 0,
            },
          },
          head: {
            backgroundColor: ts.colors.table.headerBackground,
            color: ts.colors.table.headerText,
            '&:hover': {
              backgroundColor: ts.colors.table.headerBackgroundHover,
            },
            '&.static:hover': {
              backgroundColor: ts.colors.table.headerBackground,
              cursor: 'default',
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            backgroundColor: ts.colors.white,
            textTransform: 'uppercase',
          },
          labelIcon: { minHeight: '3rem', paddingTop: 0, display: 'inline' },
        },
      },
      MuiModal: {
        styleOverrides: {
          root: {
            '& > div:focus': {
              outline: 'none',
            },
          },
        },
      },
      MuiSlider: {
        styleOverrides: {
          root: {
            '&.Mui-disabled': {
              color: ts.colors.backgroundMediumHover,
            },
          },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          root: {
            width: '100%',
            '& .MuiInputLabel-filled': {
              transform: `translate(
              ${ts.spacingUnit * 2}px,
              ${ts.spacingUnit * 3}px
            ) scale(1)`,
              height: '50%',
              overflow: 'hidden',
            },
            '& .MuiInputLabel-filled.MuiInputLabel-shrink': {
              transform: `translate(
              ${ts.spacingUnit * 2}px,
              ${ts.spacingUnit / 2}px
            ) scale(0.57)`,
            },
          },
          popupIndicator: {
            padding: ts.spacingUnit * 1.5,
          },
          option: {
            paddingTop: 0,
            paddingBottom: 0,
            minHeight: 'auto',
          },
          endAdornment: {
            position: 'unset',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            maxWidth: `calc(100% - (2em + ${ts.spacingUnit * 3}px)) !important`,
          },
        },
      },
      MuiPickersToolbarButton: {
        styleOverrides: {
          toolbarBtn: {
            '& + h3': { marginBottom: '10px' },
          },
        },
      },
      MuiTreeItem: {
        styleOverrides: {
          group: {
            marginLeft: 8,
            paddingLeft: 16,
            borderLeft: `1px dashed ${ts.colors.textPrimary}`,
          },
          label: {
            padding: `${ts.spacingUnit}px ${ts.spacingUnit * 2}px !important`,
            margin: `${ts.spacingUnit}px ${0}px`,
            borderRadius: 8,
            border: `2px solid ${ts.colors.backgroundDefault}`,
            width: 'auto',
            fontWeight: 600,
          },
        },
      },
    },
  };
}
