import * as React from 'react';

import { Box, Flex, Popover, Tooltip, Typography } from '@strapi/design-system';
import { SortIcon, stopPropagation } from '@strapi/helper-plugin';
import get from 'lodash/get';
import { useIntl } from 'react-intl';
import styled from 'styled-components';

import { useTypedSelector } from '../../store/hooks';
import { getTranslation } from '../../utils/getTranslation';

const Button = styled.button`
  svg {
    > g,
    path {
      fill: ${({ theme }) => theme.colors.neutral500};
    }
  }
  &:hover {
    svg {
      > g,
      path {
        fill: ${({ theme }) => theme.colors.neutral600};
      }
    }
  }
  &:active {
    svg {
      > g,
      path {
        fill: ${({ theme }) => theme.colors.neutral400};
      }
    }
  }
`;

const ActionWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${32 / 16}rem;
  width: ${32 / 16}rem;
  svg {
    height: ${4 / 16}rem;
  }
`;

const mapToLocaleName = (
  locales: {
    code: string;
    name: string;
    isDefault: boolean;
  }[],
  localeCode: string
) =>
  get(
    locales.find(({ code }) => code === localeCode),
    'name',
    localeCode
  );

type LocaleListCellProps = {
  id: number;
  localizations: Array<{ locale: string }>;
  locale: string;
};

const LocaleListCell = ({ localizations, locale: currentLocaleCode, id }: LocaleListCellProps) => {
  const locales = useTypedSelector((state) => state.i18n_locales.locales);
  const allLocalizations = [{ locale: currentLocaleCode }, ...localizations];
  const localizationNames = allLocalizations.map((locale) => locale.locale);
  const defaultLocale = locales.find((locale) => locale.isDefault);
  const hasDefaultLocale = defaultLocale ? localizationNames.includes(defaultLocale.code) : false;
  const [visible, setVisible] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const { formatMessage } = useIntl();

  let localesArray = [];

  if (hasDefaultLocale) {
    const ctLocalesWithoutDefault = localizationNames.filter(
      (locale) => locale !== defaultLocale?.code
    );
    const ctLocalesNamesWithoutDefault = ctLocalesWithoutDefault.map((locale) =>
      mapToLocaleName(locales, locale)
    );

    ctLocalesNamesWithoutDefault.sort();

    const ctLocalesNamesWithDefault = [
      `${defaultLocale?.name} (default)`,
      ...ctLocalesNamesWithoutDefault,
    ];

    localesArray = ctLocalesNamesWithDefault;
  } else {
    const ctLocales = localizationNames.map((locale) => mapToLocaleName(locales, locale));
    ctLocales.sort();

    localesArray = ctLocales;
  }

  const handleTogglePopover = () => setVisible((prev) => !prev);

  const elId = `entry-${id}__locale`;
  const localesNames = localesArray.join(', ');

  return (
    <Flex {...stopPropagation}>
      <Tooltip
        label={formatMessage({
          id: getTranslation('CMListView.popover.display-locales.label'),
          defaultMessage: 'Display translated locales',
        })}
      >
        <Button type="button" onClick={handleTogglePopover} ref={buttonRef}>
          <Flex>
            <Typography
              style={{ maxWidth: '252px', cursor: 'pointer' }}
              data-for={elId}
              data-tip={localesNames}
              textColor="neutral800"
              ellipsis
            >
              {localesNames}
            </Typography>
            <ActionWrapper>
              <SortIcon />

              {visible && (
                <Popover
                  onDismiss={handleTogglePopover}
                  source={buttonRef as React.MutableRefObject<HTMLElement>}
                  spacing={16}
                  centered
                >
                  <ul>
                    {localesArray.map((name) => (
                      <Box key={name} padding={3} as="li">
                        <Typography>{name}</Typography>
                      </Box>
                    ))}
                  </ul>
                </Popover>
              )}
            </ActionWrapper>
          </Flex>
        </Button>
      </Tooltip>
    </Flex>
  );
};

export default LocaleListCell;
