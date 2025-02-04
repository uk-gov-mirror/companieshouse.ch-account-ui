import PropTypes from 'prop-types'
import React from 'react'
import InputField from '../general-ui/interaction/InputField'
import { errorsPropType } from '../../services/propTypes'
import LinkText from '../general-ui/interaction/LinkText'
import { translate } from '../../services/translate'
import withLang from '../../services/lang/withLang'

const PasswordCallback = ({ lang, errors = [], element, customElementProps = {}, hasShowPasswordSuffix = true, groupError = undefined }) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const id = element.payload.input[0].name
  const label = customElementProps.prompt || element.getPrompt()

  return (
    <InputField
      id={id}
      type={showPassword ? 'text' : 'password'}
      autoComplete="current-password"
      label={label}
      errors={errors}
      testId="passwordInputField"
      suffix={hasShowPasswordSuffix === true && <LinkText
        testId={`showHidePassword_${id}`}
        href={'#showHidePassword'}
        onClick={(ev) => {
          ev.preventDefault()
          ev.stopPropagation()

          setShowPassword(!showPassword)

          return false
        }}
        style={{ paddingLeft: '1em', paddingRight: '1em' }}
      >
        {translate(lang, `PASSWORD_${showPassword ? 'HIDE' : 'SHOW'}`)}
      </LinkText>}
      groupError={groupError}
      {...customElementProps}
    />
  )
}

export default withLang(PasswordCallback)

PasswordCallback.propTypes = {
  customElementProps: PropTypes.object,
  element: PropTypes.object.isRequired,
  hasShowPasswordSuffix: PropTypes.bool,
  lang: PropTypes.string.isRequired,
  errors: errorsPropType
}

PasswordCallback.defaultProps = {
  customElementProps: {},
  errors: [],
  hasShowPasswordSuffix: true
}
