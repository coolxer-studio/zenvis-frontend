<template>
  <a-modal v-model:visible="visible" title="修改密码" @ok="handleOk" @cancel="handleCancel">
    <a-form
      ref="formRef"
      :model="formPassword"
      name="login"
      autocomplete="off"
      :labelCol="{ span: 6 }" :wrapperCol="{ span: 16 }"
    >
      <a-form-item name="password" v-bind="validateInfos.old_password" label="原密码">
        <a-input-password class="login-input" placeholder="请输入密码" v-model:value="formPassword.old_password">
        </a-input-password>
      </a-form-item>
      <a-form-item name="password" v-bind="validateInfos.password" label="密码">
        <a-input-password class="login-input" placeholder="请输入密码" v-model:value="formPassword.password">
        </a-input-password>
      </a-form-item>
      <a-form-item name="password_copy" v-bind="validateInfos.password_copy" label="再次输入密码">
        <a-input-password class="login-input" placeholder="请输入密码" v-model:value="formPassword.password_copy">
        </a-input-password>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup lang="ts">
  import {reactive, ref, toRaw, watch} from "vue";
  import {Form} from 'ant-design-vue';
  import type { FormInstance } from 'ant-design-vue';
  import {rules} from '@u/tool';
  const useForm = Form.useForm;
  interface IUserFrom {
    old_password: string;
    password: string;
    password_copy: string;
  }
  const props = defineProps({
    show: {
      type: Boolean,
      default: () => {
        return false
      }
    }
  });
  const emit = defineEmits({
    'on-ok': null,
    'on-cancel': null,
  });
  let visible = ref<boolean>(false)
  const formRef = ref<FormInstance>();
  let formPassword = reactive<IUserFrom>({
    old_password: '',
    password: '',
    password_copy: ''
  });
  const ruleEmail = (rule: any, value: string) => {
    if (!value) {
      return Promise.reject('请输入电子邮箱');
    } else if (!rules.mainRule(value)) {
      return Promise.reject('联系人邮箱格式不正确');
    } else {
      return Promise.resolve();
    }
  };
  const newPass = (rule: any, value: string) => {
    // 修改用户信息弹框，若填写信息，默认为用户的原密码
    // 修改页面，不填写密码，跳过验证
    if (value) {
      if (!rules.passwordRule(value)) {
        return Promise.reject('请输入8~16位由大小写英文、数字、@!#$组成的密码！');
      } else {
        return Promise.resolve();
      }
    } else if (value === '') {
      return Promise.reject('请输入密码');
    } else {
      return Promise.resolve();
    }
  };

  const reNewPass = (rule: any, value: string) => {
    // 修改用户信息弹框，若填写信息，默认为用户的原密码
    if (value) {
      if (value === formPassword.password) {
        return Promise.resolve();
      } else if (value !== formPassword.password) {
        return Promise.reject('两次输入密码不一致!');
      }
    } else if (value === '') {
      return Promise.reject('请输入密码');
    }
  };
  let formRules = reactive({
    old_password: [{ required: true, message: '请输入原密码', trigger: 'change' }],
    password: [{ required: true, validator: newPass, trigger: 'change' }],
    password_copy: [{ required: true, validator: reNewPass, trigger: 'change' }],
  });
  const { resetFields, validate, validateInfos } = useForm(formPassword, formRules);
  watch(
    () => props.show,
    (newVal, oldVal) => {
      visible.value = newVal
      resetFields()
    }
  )
  const handleCancel = () => {
    resetFields()
    emit('on-cancel');
  }
  const handleOk = () => {
    validate()
      .then(() => {
        const data = JSON.parse(JSON.stringify(toRaw(formPassword)))
        delete data['password_copy']
        emit('on-ok', data);
        // resetFields()
      })
      .catch(err => {
        console.log('error', err);
      });

  }
</script>
