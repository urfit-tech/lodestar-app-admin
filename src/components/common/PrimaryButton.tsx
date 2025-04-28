import { Button, ButtonProps } from '@chakra-ui/react'
import { useAppTheme } from 'lodestar-app-element/src/contexts/AppThemeContext'

interface PrimaryButtonProps extends ButtonProps {
  isDanger?: boolean
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ h, height, children, onClick, isDanger, ...rest }) => {
  const theme = useAppTheme()

  return (
    <Button
      type="submit"
      h={h || height || '45px'}
      textColor={isDanger ? theme.colors.danger['500'] : '#ffffff'}
      bgColor={isDanger ? '#ffffff' : theme.colors.primary['500']}
      border={isDanger ? `1px solid ${theme.colors.danger['500']}` : 'none'}
      _hover={{
        bgColor: isDanger ? '#ffffff' : theme.colors.primary['500'],
        filter: 'brightness(1.1)',
      }}
      {...rest}
    >
      {children}
    </Button>
  )
}

export default PrimaryButton
