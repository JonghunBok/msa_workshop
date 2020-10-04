# MSA 워크샵

일정: 2020.10.06

## 목표

12 factor를 준수하는 마이크로 서비스를 직접 만들어 보며
MSA에 대한 이해를 높인다.
각 서비스는 컨테이너화하여 Kubernetes 위에서 돌아갈 것을
상정한다.

## TODO: 왜 12 factor?

## 개요

### 1. 코드베이스

> 코드베이스와 앱은 항상 1대 1 관계를 가지며,
> 코드베이스는 버전 관리한다.

git을 이용해 repo를 만든다.


### 2. 종속성 (Dependencies)

> Twelve-Factor App은 전체 시스템에 특정 패키지가 암묵적으로 존재하는 것에 절대 의존하지 않습니다. 

Twelve-Factor App의 작동을 호스트로부터 철저히 분리한다.
curl, ImageMagick 등은 많은 시스템에 기본적으로 설치되지만,
없을 수도 있기 때문에, 앱이 호스트에 대한 어떤 전제를 가져선 안된다.
Python이라면 pip를 이용해 종속성 선언을 하고,  Virtualenv를
통해 종속선 분리를 한다. 

이번 워크샵에선 Docker를 이용해 모든 종속성을 컨테이너에 담는다.

### 3. 설정 (Config)

> "핵심은 환경변수를 활용하라는 것!"

Twelve-Factor는 **설정을 코드에서 엄격하게 분리하는 것**을 요구합니다.
설정을 상수로 코드에 저장하지 말라! 
애플리케이션의 모든 설정이 정상적으로 코드 바깥으로 분리되어야 한다.
이를 확인 하기 위한 간단한 방법은 코드베이스가 바로 오픈 소스가 되어도
유출되는 인증정보가 없는지 보는 것이다.

Twelve-Factor App은 설정을 환경 변수 (envvars나 env라고도 불림)에 저장한다.


### 4. 백엔드 서비스 (Backing Services)

> 백엔드 서비스를 연결된 리로스로 취급

**백엔드 서비스(Backing Services)**
: 애플리케이션 정상 동작 중 네트워크를 통해 이용하는 모든 서비스. 

데이터 베이스, 메시지 대기열 시스템, SMTP 서비스, 캐시 시스템 등이 
모두 백엔드 서비스이다.
> **Twelve-Factor App의 코드는 로컬 서비스와 서드파티 서비스를 구별하지 않습니다.**
양 쪽 모두 연결된 리소스이며, 설정에 있는 URL 혹은 다른 로케이터와 인증 정보를 사용해서 접근 됩니다. Twelve-Factor App의 배포는 애플리케이션 코드를 수정하지 않고 로컬에서 관리되는 MySQL DB를 서드파티에서 관리되는 DB(예: Amazon RDS)로 전환할 수 있어야 합니다. 마찬가지로, 로컬 SMTP 서버는 서드파티 SMTP 서비스(예: Postmark)로 코드 수정 없이 전환이 가능해야 합니다. 두 경우 모두 설정에 있는 리소스 핸들만 변경하면 됩니다.



### 5. 빌드, 릴리즈, 실행 (Build, Release, Run)

> **Twelve-Factor App은 빌드, 릴리즈, 실행 단계를 엄격하게 서로 분리합니다.**


우리는 Kubernetes의 ConfigMap을 이용할 것이다. 

![컴파일만 하는 게 아니라구](https://12factor.net/images/release.png)


### 6. 프로세스 (Processes)

> **Twelve-Factor 프로세스는 무상태(stateless)이며, 아무 것도 공유하지 않습니다.**

유지될 필요가 있는 모든 데이터는 데이터베이스 같은 안정된 백엔드 서비스에 저장되어야 합니다.

유지되어야 하는 세션 상태 데이터 같은 경우에도 Memcached나 redis처럼 유효기간을 제공하는 데이터 저장소에 저장하는 것이 적합하다.

이는 [REST 아키텍처 스타일](https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm) 5.1.3 Stateless 와 상통한다. 
//TODO: 부연 설명. 


### 7. 포트 바인딩 (Port Binding)

> 포트 바인딩을 사용한다는 것은 하나의 앱이 다른 앱을 위한 백엔드 서비스가 될 수 있다는 것을 의미한다는 점에 주목합시다.

포트 바인딩을 통해서 서비스를 공개하자. 

우리는 쿠버네티스의 [Service API](https://kubernetes.io/ko/docs/concepts/services-networking/service/)를 이용할 것이다. 


### 8. 동시성 (Concurrency)
> 애플리케이션은 여러개의 물리적인 머신에서 돌아가는 여러개의 프로세스로 넓게 퍼질 수 있어야만 합니다.


### 9. 폐기 가능 (Disposability)

> 켜질 땐 신속히, 꺼질 땐 우아하게, 갑자기 죽어도 괜찮게 큐잉 서비스를 이용하자.


### 10. dev/prod 일치 (Dev Prod Parity)

> Twelve-Factor 개발자는 개발 환경과 production 환경에서 다른 백엔드 서비스를 쓰고 싶은 충동에 저항합니다.


DevOps 철학의 일부를 엿볼 수 있다. 



### 11. 로그 (Logs)

> Twelve-Factor App은 아웃풋 스트림의 전달이나 저장에 절대 관여하지 않습니다.

각 프로세스는 이벤트 스트림을 버펄이 없이 stdout에 출력한다.


### 12. Admin 프로세스 (Admin Processes)

> SSH 소리 안나게 해라? 

